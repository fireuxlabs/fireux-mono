import {
  isAppUserRole,
  isAppUserSubscription,
} from '../runtime/app/models/app-user.model.ts'
import { userDisplayNameSeed } from '../runtime/user/utils/display-name-seed.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

function load(path, name, dependencies = {}) {
  dependencies = {
    userDisplayNameSeed, isAppUserRole,
    getCurrentScope: () => null,
    captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
    useCurrentUser: () => ({ get value() { return dependencies.getAuth?.().currentUser ?? null } }),
    ...dependencies,
  }
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function deferred() {
  let resolve, reject
  const promise = new Promise((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}

const memberships = (appId) => `apps/${appId}/users`
const contract = load(
  '../runtime/app/server/app-user/command-contract.ts',
  '{ appGovernancePatch, countTransactionAdmins, forbidden, initialMembership, isAdminMembership, requireAdmin, requireCanonicalMembership, roleFrom, stamp }',
  {
    createError: ({ statusCode, statusMessage }) =>
      Object.assign(new Error(statusMessage), { statusCode }),
    FieldValue: { serverTimestamp: () => ({ seconds: 123, nanoseconds: 0 }) },
    isAppUserRole,
    isAppUserSubscription,
    USER_MUTATION_TARGETS: { runtimeUsers: 'users' },
    serverAppUsersTarget: memberships,
  }
)

test('App membership retains only its role, subscription and timestamps', () => {
  const membership = contract.initialMembership('person', 'user')
  assert.deepEqual(membership, {
    role: 'user',
    subscription: 'free',
    created: { at: { seconds: 123, nanoseconds: 0 }, by: 'person' },
    updated: { at: { seconds: 123, nanoseconds: 0 }, by: 'person' },
  })
  assert.doesNotThrow(() => contract.requireCanonicalMembership(membership))
  assert.throws(
    () =>
      contract.requireCanonicalMembership({
        ...membership,
        role: 'invalid',
      }),
    { statusCode: 409 }
  )
})

function provisioner() {
  const currentUser = ref({ uid: 'A', isAnonymous: false })
  const state = ref({ uid: null, status: 'idle', generation: 0 })
  const lastError = ref(null)
  const accounts = []
  const bootstrapped = []
  const cleared = []
  const make = load(
    '../runtime/composables/fireux/firebase/auth-account-provisioning.ts',
    'createAuthAccountProvisioner',
    {
      computed,
      readPendingAccountConsent: () => 'current-terms',
      clearPendingAccountConsent: () => cleared.push(currentUser.value.uid),
      provisionSignedInUserAccount: (user) => {
        const gate = deferred()
        accounts.push({ uid: user.uid, ...gate })
        return gate.promise
      },
    }
  )
  const actions = make({
    currentUser,
    state,
    lastError,
    isReady: ref(true),
    userCreate: {
      bootstrapUser: async (user) => bootstrapped.push(user.uid),
    },
  })
  return {
    ...actions,
    currentUser,
    state,
    lastError,
    accounts,
    bootstrapped,
    cleared,
  }
}

test('successful provisioning shares its in-flight request and bootstraps the captured account once', async () => {
  const subject = provisioner()
  const first = subject.createOnce('A')
  const duplicate = subject.createOnce('A')
  assert.equal(subject.accounts.length, 1)
  subject.accounts[0].resolve()
  await Promise.all([first, duplicate])
  assert.deepEqual(subject.bootstrapped, ['A'])
  assert.deepEqual(subject.cleared, ['A'])
  assert.equal(subject.state.value.status, 'success')
})

for (const fail of [false, true]) {
  test(`a stale account ${fail ? 'failure' : 'success'} cannot affect the next signed-in account`, async () => {
    const subject = provisioner()
    const old = subject.createOnce('A')
    subject.reset('A')
    subject.currentUser.value = { uid: 'B', isAnonymous: false }
    const current = subject.createOnce('B')
    const expectedState = { ...subject.state.value }
    if (fail)
      subject.accounts[0].reject(new Error('Old account request failed'))
    else subject.accounts[0].resolve()
    await old
    assert.deepEqual(subject.state.value, expectedState)
    assert.equal(subject.lastError.value, null)
    assert.deepEqual(subject.bootstrapped, [])
    assert.deepEqual(subject.cleared, [])
    subject.accounts[1].resolve()
    await current
    assert.deepEqual(subject.bootstrapped, ['B'])
    assert.deepEqual(subject.cleared, ['B'])
  })
}

test('reset invalidates an older provisioning generation even when the same account signs back in', async () => {
  const subject = provisioner()
  const old = subject.createOnce('A')
  subject.reset('A')
  const current = subject.createOnce('A')
  subject.accounts[0].resolve()
  await old
  assert.deepEqual(subject.bootstrapped, [])
  assert.deepEqual(subject.cleared, [])
  subject.accounts[1].resolve()
  await current
  assert.deepEqual(subject.bootstrapped, ['A'])
})

test('current provisioning errors remain visible and an explicit retry can succeed', async () => {
  const subject = provisioner()
  const first = subject.createOnce('A')
  const failure = new Error('Account unavailable')
  subject.accounts[0].reject(failure)
  await assert.rejects(first, failure)
  assert.equal(subject.state.value.status, 'failed')
  assert.equal(subject.lastError.value, failure)
  const retry = subject.retry()
  subject.accounts[1].resolve()
  assert.equal(await retry, true)
  assert.deepEqual(subject.bootstrapped, ['A'])
})

for (const boundary of [
  'identity',
  'membership-command',
  'event-token',
  'event',
]) {
  test(`account switching during bootstrap ${boundary} cannot start its next stage`, async () => {
    const gate = deferred()
    const reached = deferred()
    const calls = []
    const pause = async (stage) => {
      calls.push(stage)
      if (boundary === stage) {
        reached.resolve()
        await gate.promise
      }
    }
    const user = {
      uid: 'A',
      displayName: 'Account A',
      getIdToken: async () => {
        await pause('event-token')
        return 'token-A'
      },
    }
    const auth = { currentUser: user }
    const make = load(
      '../runtime/user/composables/identity/useUserBootstrap.ts',
      'useUserBootstrap',
      {
        runAppUserCommand: async (input, supplied) => {
          assert.deepEqual(input, { action: 'ensure-self' })
          assert.equal(supplied.uid, 'A')
          await pause('membership-command')
          return { created: true }
        },
        getAuth: () => auth,
        useFireUXConfig: () => ({ appId: 'app' }),
        requireUid: async () => {
          throw new Error('Bootstrap must retain its supplied Auth identity')
        },
        provisionUserIdentity: async (uid) => {
          assert.equal(uid, 'A')
          await pause('identity')
          return { created: true }
        },
        fetch: async (url) => {
          assert.equal(url, '/api/internal/events/user-joined')
          await pause('event')
          return { ok: true, json: async () => ({ event: { created: true } }) }
        },
      }
    )
    const flight = make().bootstrapUser(user)
    await reached.promise
    const before = [...calls]
    auth.currentUser = { uid: 'B' }
    gate.resolve()
    await assert.rejects(flight, /signed-in account changed/)
    assert.deepEqual(calls, before)
  })
}

test('bootstrap rejects an intended account that is no longer signed in before creating identity', async () => {
  const make = load(
    '../runtime/user/composables/identity/useUserBootstrap.ts',
    'useUserBootstrap',
    {
      useFireUXConfig: () => ({ appId: 'app' }),
      getAuth: () => ({ currentUser: { uid: 'B' } }),
    }
  )
  await assert.rejects(
    make().bootstrapUser({ uid: 'A' }),
    /signed-in account changed/
  )
})

for (const action of ['ensure-self', 'bootstrap-admin', 'remove-member']) {
  test(`App ${action} rejects an obsolete account during token acquisition`, async () => {
    const token = deferred()
    const reached = deferred()
    const requests = []
    let currentUser = {
      uid: 'A',
      getIdToken: () => {
        reached.resolve()
        return token.promise
      },
    }
    const actor = currentUser
    const run = load(
      '../runtime/app/utils/runAppUserCommand.ts',
      'runAppUserCommand',
      {
        useAuth: () => ({ currentUser: { get value() { return currentUser } } }),
        useFireUXConfig: () => ({ appId: 'app' }),
        captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
        fetch: async (url, options) => {
          requests.push({ url, options })
          return { ok: true, json: async () => ({ created: true, removed: true }) }
        },
      }
    )
    const flight = run({ action, ...(action === 'remove-member' ? { userId: 'A' } : {}) }, actor)
    await reached.promise
    currentUser = { uid: 'B', getIdToken: async () => 'token-B' }
    token.resolve('token-A')
    await assert.rejects(flight, /context changed/)
    assert.equal(requests.length, 0)
  })
}

test('removing a disposable member revokes live domain access and a new membership cannot reuse old grants', async () => {
  const uid = 'disposable-member'
  const created = { seconds: 100, nanoseconds: 0 }
  const membership = ref({
    role: 'user',
    subscription: 'free',
    created: { at: created },
  })
  const admin = { role: 'admin', created: { at: created } }
  const stored = new Map([
    [`${memberships('app')}/${uid}`, membership.value],
    [`${memberships('app')}/administrator`, admin],
  ])
  const accessContract = load(
    '../runtime/app/utils/membership-access.ts',
    'readMembershipAccessIds'
  )
  const useAccess = load(
    '../runtime/app/composables/membership/useMembershipAccess.ts',
    'useMembershipAccess',
    {
      computed,
      toValue,
      readMembershipAccessIds: accessContract,
      useFirestoreRead: () => ({
        firestoreFetchDoc: () =>
          Object.assign(
            ref({ ids: ['workspace'], membership_created_at: created }),
            { pending: ref(false), error: ref(), outcome: ref('ready') }
          ),
      }),
    }
  )
  const kitchen = useAccess('apps/app/kitchen-access', ref(uid), membership)
  const project = useAccess('apps/app/project-access', ref(uid), membership)
  assert.deepEqual(kitchen.ids.value, ['workspace'])
  assert.deepEqual(project.ids.value, ['workspace'])
  const handler = load(
    '../runtime/app/server/app-user/remove.ts',
    'handleRemoveMember',
    {
      ...contract,
      stamp: (by) => ({ by }),
      isAdminMembership: (value) => value?.role === 'admin',
      countTransactionAdmins: async () => 1,
      requireFirestoreDocumentId: (id) => id,
      serverAppUsersTarget: memberships,
      APP_MUTATION_TARGETS: { runtimeApps: 'apps' },
    }
  )
  const writes = []
  const mutations = {
    read: async (target, id) => {
      assert.equal(writes.length, 0)
      const data = stored.get(`${target}/${id}`)
      return { exists: data != null, data }
    },
    delete: (target, id) => writes.push(() => stored.delete(`${target}/${id}`)),
    create: (target, id, data) =>
      writes.push(() => stored.set(`${target}/${id}`, data)),
    update: (target, id, data) =>
      writes.push(() =>
        stored.set(`${target}/${id}`, {
          ...stored.get(`${target}/${id}`),
          ...data,
        })
      ),
  }
  const result = await handler({
    context: {
      actorUid: 'administrator',
      appId: 'app',
      input: { action: 'remove-member', userId: uid },
    },
    actorMembershipExists: true,
    actorMembership: admin,
    mutations,
  })
  assert.equal(result.removed, true)
  writes.forEach((commit) => commit())
  membership.value = stored.get(`${memberships('app')}/${uid}`) ?? null
  for (const access of [kitchen, project]) {
    assert.deepEqual(access.ids.value, [])
    assert.equal(access.outcome.value, 'idle')
  }
  assert.equal(stored.get(`${memberships('app')}/administrator`), admin)
  membership.value = {
    role: 'user',
    subscription: 'free',
    created: { at: { seconds: 200, nanoseconds: 0 } },
  }
  for (const access of [kitchen, project]) {
    assert.deepEqual(access.ids.value, [])
    assert.equal(access.outcome.value, 'empty')
  }
})
