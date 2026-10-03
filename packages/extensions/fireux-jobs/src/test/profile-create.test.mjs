import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { ref, reactive, watch } from 'vue'
const dispose=[]
const useCommandScope=load('../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts','useCommandScope',{watch,onScopeDispose:fn=>dispose.push(fn)})

function load(path, name, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function workflow(name, { pause, bootstrapError } = {}) {
  const kind = name.toLowerCase()
  const base = `../runtime/user/composables/profiles/${name}`
  const config = load(`${base}/config/${kind}Config.ts`, `${kind}Config`)
  const gate = deferred()
  const reached = deferred()
  const events = []
  const requests = []
  let identityLookups = 0
  const stage = async (name) => {
    events.push(name)
    if (pause === name) {
      reached.resolve()
      await gate.promise
    }
  }
  const actor = {
    uid: 'person-a',
    getIdToken: async () => {
      await stage('token')
      return 'token-a'
    },
  }
  const auth = reactive({ currentUser: actor })
  const profileDeps={ref,watch,useCommandScope,useAuth:()=>({currentUser:{get value(){return auth.currentUser}}}),useUserSession:()=>({appUser:ref({role:'user'}),appPending:ref(false),appError:ref(null),appOutcome:ref('ready')}),useFireUXConfig:()=>({appId:'app'}),useRoute:()=>({fullPath:'/profile'})}
  const useProfileCreate = load(
    '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate.ts',
    'useProfileCreate',
    {
      ...profileDeps,
      getAuth: () => auth,
      requireUid: async () => {
        identityLookups++
        return { uid: auth.currentUser.uid, auth: auth.currentUser }
      },
      fetch: async (url, options) => {
        requests.push({ url, options })
        await stage('request')
        return {
          ok: true,
          json: async () => ({
            ok: true,
            userId: 'person-a',
            profileKind: kind,
            createdProfile: true,
            createdAppState: config.storage === 'user-with-app-state',
          }),
        }
      },
    }
  )
  const creator = load(
    `${base}/mutations/use${name}Create.ts`,
    `use${name}Create`,
    {
      ...profileDeps,
      [`${kind}Config`]: config,
      useRequireUser: async () => actor,
      useProfileCreate,
      useUserBootstrap: () => ({
        bootstrapUser: async (user) => {
          assert.equal(user, actor)
          await stage('bootstrap')
          if (bootstrapError) throw bootstrapError
          return { id: user.uid }
        },
      }),
    }
  )()
  return {
    create: creator[`create${name}Profile`],
    createDirect: useProfileCreate(config).createProfile,
    config,
    requests,
    events,
    identityLookups: () => identityLookups,
    switchAccount: () => {
      auth.currentUser = { uid: 'person-b' }
    },
    reached: reached.promise,
    release: gate.resolve,
  }
}

for (const name of ['Professional', 'Agent']) {
  test(`${name} creation bootstraps its captured account before fixed-route profile provisioning`, async () => {
    const subject = workflow(name)
    const result = await subject.create()
    assert.deepEqual(subject.events, ['bootstrap', 'token', 'request'])
    assert.equal(
      subject.identityLookups(),
      0,
      'profile command must retain the workflow actor'
    )
    assert.deepEqual(result, {
      createdProfile: true,
      createdAppState: subject.config.storage === 'user-with-app-state',
      id: 'person-a',
    })
    assert.equal(subject.requests.length, 1)
    assert.equal(subject.requests[0].url, subject.config.provisionRoute)
    assert.equal(
      subject.requests[0].options.headers.authorization,
      'Bearer token-a'
    )
    assert.equal(
      subject.requests[0].options.body,
      undefined,
      'no target uid or profile data is sent'
    )
  })

  test(`${name} creation stops when User bootstrap fails`, async () => {
    const failure = new Error('Join this App before creating a profile.')
    const subject = workflow(name, { bootstrapError: failure })
    await assert.rejects(subject.create(), failure)
    assert.deepEqual(subject.events, ['bootstrap'])
    assert.deepEqual(subject.requests, [])
  })

  for (const pause of ['bootstrap', 'token', 'request']) {
    test(`${name} creation cannot continue as another account after ${pause}`, async () => {
      const subject = workflow(name, { pause })
      const flight = subject.create()
      await subject.reached
      subject.switchAccount()
      subject.release()
      if (pause === 'request') assert.equal((await flight).id, 'person-a')
      else await assert.rejects(flight, /signed-in account changed/)
      assert.equal(subject.identityLookups(), 0)
      assert.equal(subject.requests.length, pause === 'request' ? 1 : 0)
      if (subject.requests.length)
        assert.equal(
          subject.requests[0].options.headers.authorization,
          'Bearer token-a'
        )
    })
  }
}
