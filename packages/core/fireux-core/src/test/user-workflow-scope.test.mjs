import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  ref,
  reactive,
  watch,
  effectScope,
  getCurrentScope,
  onScopeDispose,
} from 'vue'

function load(path, name, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const useCommandScope = load(
  '../runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
const captureCommandScope = load(
  '../runtime/composables/fireux/commands/useCommandScope.ts',
  'captureCommandScope',
  { watch }
)
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const stages = [
  'credentials',
  'identity',
  'membership-read',
  'policy',
  'membership-command',
  'event-token',
  'event',
]
function bootstrapHarness(boundary, outsideScope = false) {
  const reached = deferred(),
    release = deferred(),
    calls = [],
    scope = effectScope()
  const pause = async (stage) => {
    calls.push(stage)
    if (stage === boundary) {
      reached.resolve()
      await release.promise
    }
  }
  const actor = {
    uid: 'A',
    displayName: 'Account A',
    getIdToken: async () => {
      await pause('event-token')
      return 'token-A'
    },
  }
  const currentUser = ref(actor),
    config = reactive({ appId: 'app' })
  let stopped = 0
  const make = load(
    '../runtime/user/composables/identity/useUserBootstrap.ts',
    'useUserBootstrap',
    {
      getCurrentScope,
      useCommandScope,
      captureCommandScope: (sources) => {
        const captured = captureCommandScope(sources)
        return {
          ...captured,
          stop() {
            stopped++
            captured.stop()
          },
        }
      },
      useCurrentUser: () => currentUser,
      useFirestore: () => ({}),
      useFireUXConfig: () => config,
      getAuth: () => ({ currentUser: currentUser.value }),
      doc: () => ({}),
      requireUid: async () => {
        await pause('credentials')
        return { auth: actor }
      },
      provisionUserIdentity: async (uid) => {
        assert.equal(uid, 'A')
        await pause('identity')
        return { created: true }
      },
      getDoc: async () => {
        await pause('membership-read')
        return { exists: () => false }
      },
      runAppUserCommand: async (input, supplied) => {
        assert.deepEqual(input, { action: 'ensure-self' })
        assert.equal(supplied.uid, 'A')
        await pause('membership-command')
        return { created: true }
      },
      fetch: async (url) => {
        if (url === '/api/app/status') {
          await pause('policy')
          return {
            ok: true,
            json: async () => ({
              appId: 'app',
              initialized: true,
              selfJoinEnabled: true,
            }),
          }
        }
        assert.equal(url, '/api/internal/events/user-joined')
        await pause('event')
        return { ok: true, json: async () => ({ event: { created: true } }) }
      },
    }
  )
  const controller = outsideScope ? make() : scope.run(() => make())
  return {
    controller,
    currentUser,
    config,
    actor,
    scope,
    calls,
    reached: reached.promise,
    release: release.resolve,
    stopped: () => stopped,
  }
}
for (const boundary of stages) {
  for (const changed of [
    'account',
    'account-round-trip',
    'app-round-trip',
    'disposal',
  ]) {
    test(`User bootstrap stops following stages after ${changed} during ${boundary}`, async () => {
      const h = bootstrapHarness(boundary),
        flight = h.controller.bootstrapUser()
      await h.reached
      const callsBefore = [...h.calls]
      if (changed.startsWith('account')) {
        h.currentUser.value = { uid: 'B' }
        if (changed === 'account-round-trip') h.currentUser.value = h.actor
      } else if (changed === 'app-round-trip') {
        h.config.appId = 'other'
        h.config.appId = 'app'
      } else h.scope.stop()
      h.release()
      await assert.rejects(flight, /account changed/)
      assert.deepEqual(h.calls, callsBefore)
      h.scope.stop()
    })
  }
}
test('A stable bootstrap preserves User, App membership and joined-event results', async () => {
  const h = bootstrapHarness('none')
  assert.deepEqual(await h.controller.bootstrapUser(), {
    createdCore: true,
    createdApp: true,
    createdAppEvent: true,
    appEventReady: true,
    id: 'A',
  })
  assert.deepEqual(h.calls, stages)
  h.scope.stop()
})
for (const changed of [false, true]) {
  test(`Bootstrap outside component setup releases temporary watchers on ${changed ? 'failure' : 'success'}`, async () => {
    const h = bootstrapHarness('identity', true),
      flight = h.controller.bootstrapUser()
    await h.reached
    if (changed) {
      h.currentUser.value = { uid: 'B' }
      h.currentUser.value = h.actor
    }
    h.release()
    if (changed) await assert.rejects(flight, /account changed/)
    else assert.equal((await flight).id, 'A')
    assert.equal(h.stopped(), 1)
  })
}

function profileHarness(action) {
  const reached = deferred(),
    reply = deferred(),
    requests = [],
    scope = effectScope()
  const actor = {
    uid: 'A',
    getIdToken: async () => {
      reached.resolve()
      return reply.promise
    },
  }
  const currentUser = ref(actor),
    user = ref({ id: 'A' })
  const deps = {
    useAuth: () => ({ currentUser }),
    useCommandScope,
    captureCommandScope,
    useRequireUser: async () => actor,
    validateUserHandleForPublicRoute: (handle) => ({ isValid: true, handle }),
    USER_ECOSYSTEM_AVATAR_SRC: '/img/ecosystem/avatar.png',
    fetch: async (url, options) => {
      requests.push({ url, options })
      return {
        ok: true,
        json: async () =>
          url.endsWith('/handle')
            ? { uid: 'A', handle: 'ada', created: false, changed: true }
            : { ok: true, avatar: 'saved-avatar' },
      }
    },
  }
  const updateUserHandle = load(
    '../runtime/user/utils/update-user-handle.ts',
    'updateUserHandle',
    deps
  )
  const provisionSignedInUserAvatar = load(
    '../runtime/user/utils/provision-user-avatar.ts',
    'provisionSignedInUserAvatar',
    deps
  )
  const controller = scope.run(() =>
    load(
      '../runtime/user/composables/identity/useUserProfileUpdate.ts',
      'useUserProfileUpdate',
      { ...deps, updateUserHandle, provisionSignedInUserAvatar }
    )({ user })
  )
  const invoke = () =>
    action === 'handle'
      ? controller.handle('ada')
      : controller.avatar(new Blob(['image'], { type: 'image/png' }))
  return {
    invoke,
    user,
    currentUser,
    actor,
    scope,
    requests,
    reached: reached.promise,
    reply: reply.resolve,
  }
}
for (const action of ['handle', 'avatar']) {
  for (const changed of [
    'none',
    'record-round-trip',
    'account-round-trip',
    'disposal',
  ]) {
    test(`Profile ${action} preserves the original owner through token acquisition: ${changed}`, async () => {
      const h = profileHarness(action),
        flight = h.invoke()
      await h.reached
      if (changed === 'record-round-trip') {
        h.user.value = { id: 'B' }
        h.user.value = { id: 'A' }
      }
      if (changed === 'account-round-trip') {
        h.currentUser.value = { uid: 'B' }
        h.currentUser.value = h.actor
      }
      if (changed === 'disposal') h.scope.stop()
      h.reply('token-A')
      if (changed === 'none') {
        await flight
        assert.equal(h.requests.length, 1)
      } else {
        await assert.rejects(flight, /context changed/)
        assert.equal(h.requests.length, 0)
      }
      h.scope.stop()
    })
  }
}
for (const changed of [false, true]) {
  test(`Private account provisioning ${changed ? 'rejects an account round trip' : 'validates and returns its result'}`, async () => {
    const reached = deferred(),
      reply = deferred(),
      requests = []
    const actor = {
      uid: 'A',
      isAnonymous: false,
      getIdToken: async () => {
        reached.resolve()
        return reply.promise
      },
    }
    const currentUser = ref(actor)
    const run = load(
      '../runtime/user/utils/provision-user-account.ts',
      'provisionSignedInUserAccount',
      {
        FIREUX_ACCOUNT_TERMS_VERSION: 'terms',
        useAuth: () => ({ currentUser }),
        captureCommandScope,
        fetch: async (url, options) => {
          requests.push({ url, options })
          return {
            ok: true,
            json: async () => ({
              ok: true,
              created: false,
              terms_recorded: true,
            }),
          }
        },
      }
    )
    const flight = run(actor, 'terms')
    await reached.promise
    if (changed) {
      currentUser.value = { uid: 'B' }
      currentUser.value = actor
    }
    reply.resolve('token-A')
    if (changed) {
      await assert.rejects(flight, /context changed/)
      assert.equal(requests.length, 0)
    } else {
      assert.equal((await flight).terms_recorded, true)
      assert.deepEqual(JSON.parse(requests[0].options.body), {
        terms_version: 'terms',
      })
    }
  })
}
test('Private account provisioning rejects malformed successful responses', async () => {
  const actor = { uid: 'A', getIdToken: async () => 'token' },
    currentUser = ref(actor)
  const run = load(
    '../runtime/user/utils/provision-user-account.ts',
    'provisionSignedInUserAccount',
    {
      FIREUX_ACCOUNT_TERMS_VERSION: 'terms',
      useAuth: () => ({ currentUser }),
      captureCommandScope,
      fetch: async () => ({ ok: true, json: async () => ({ ok: true }) }),
    }
  )
  await assert.rejects(run(actor), /response was invalid/)
})
