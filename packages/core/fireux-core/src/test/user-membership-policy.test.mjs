import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function session(policy, outcome = 'ready') {
  const app = {
    app: ref({ self_join_enabled: policy }),
    outcome: ref(outcome),
    error: ref(null),
  }
  const make = load(
    '../runtime/user/composables/useUserSessionState.ts',
    'useUserSessionState',
    {
      computed,
      useFireUXConfig: () => ({ appId: 'runtime', selfJoinEnabled: !policy }),
      useAppMembershipPolicy: load(
        '../runtime/app/composables/useAppMembershipPolicy.ts',
        'useAppMembershipPolicy',
        {
          computed,
          unref,
          useFirestoreRead: () => ({
            firestoreFetchDoc: () =>
              Object.assign(app.app, {
                outcome: app.outcome,
                error: app.error,
              }),
          }),
        }
      ),
      useAuth: () => ({
        uid: ref('user'),
        isAuthenticated: ref(true),
        hasAuthState: ref(true),
        currentUser: ref({}),
      }),
      useAvatarProxy: () => ({ getProxiedAvatarUrl: (value) => value }),
      useAppUserAccess: () => ({}),
    }
  )
  const state = make({
    coreUser: ref({}),
    appUser: ref(null),
    coreOutcome: ref('ready'),
    coreError: ref(null),
    appError: ref(null),
    appPending: ref(false),
    appOutcome: ref('missing'),
  })
  return { state, app }
}

test('Stored policy controls onboarding even when build-time config disagrees', () => {
  const { state, app } = session(true)
  assert.equal(state.cta.value.key, 'join-app')
  assert.equal(state.isInitialized.value, false)
  app.app.value.self_join_enabled = false
  assert.equal(state.cta.value.key, 'avatar')
  assert.equal(state.isInitialized.value, true)
})

test('Invalid App presentation metadata does not suppress a valid membership policy', () => {
  const { state, app } = session(true)
  app.app.value = {
    self_join_enabled: true,
    media: { logo_url: null },
    name: null,
  }
  assert.equal(state.canSelfJoin.value, true)
  assert.equal(state.isInitialized.value, false)
  assert.equal(state.cta.value.key, 'join-app')
  app.app.value.self_join_enabled = false
  assert.equal(state.canSelfJoin.value, false)
  assert.equal(state.isInitialized.value, true)
})

test('Policy loading and errors cannot be mistaken for completed onboarding', () => {
  const { state, app } = session(false, 'pending')
  assert.equal(state.outcome.value, 'loading')
  assert.equal(state.isInitialized.value, false)
  app.outcome.value = 'error'
  app.error.value = new Error('Policy unavailable')
  assert.equal(state.outcome.value, 'error')
  assert.equal(state.isInitialized.value, false)
})

test('An uninitialized App does not require membership before developer setup', () => {
  const { state, app } = session(false, 'missing')
  app.app.value = null
  assert.equal(state.isInitialized.value, true)
  assert.equal(state.canSelfJoin.value, false)
})

async function bootstrap({
  enabled = false,
  initialized = true,
  seed = false,
  exists = false,
  invalid = false,
} = {}) {
  const calls = []
  const make = load(
    '../runtime/user/composables/useUserBootstrap.ts',
    'useUserBootstrap',
    {
      doc: () => ({}),
      getDoc: async () => ({ exists: () => exists }),
      useFireUXConfig: () => ({ appId: 'runtime', selfJoinEnabled: seed }),
      useFirestore: () => ({}),
      requireUid: async () => ({
        uid: 'user',
        auth: { getIdToken: async () => 'token' },
      }),
      createCoreUserDocument: async () => ({ created: true }),
      createAppUserMembership: async () => {
        calls.push('join')
        return { created: !exists }
      },
      fetch: async (url) => ({
        ok: true,
        json: async () =>
          url === '/api/app/status'
            ? {
                appId: invalid ? 'other' : 'runtime',
                initialized,
                selfJoinEnabled: enabled,
              }
            : { event: { created: true } },
      }),
    }
  )
  const result = await make().bootstrapUser()
  return { calls, result }
}

test('Bootstrap follows stored policy in both directions across stale builds', async () => {
  assert.deepEqual((await bootstrap({ enabled: true, seed: false })).calls, [
    'join',
  ])
  assert.deepEqual((await bootstrap({ enabled: false, seed: true })).calls, [])
})

test('Bootstrap leaves new Apps unjoined and preserves existing membership validation', async () => {
  assert.deepEqual(
    (await bootstrap({ enabled: true, initialized: false })).calls,
    []
  )
  const existing = await bootstrap({ exists: true, enabled: false })
  assert.deepEqual(existing.calls, ['join'])
  assert.equal(existing.result.createdApp, false)
})

test('Bootstrap rejects a status response for another App', async () => {
  await assert.rejects(bootstrap({ invalid: true }), /invalid response/)
})
