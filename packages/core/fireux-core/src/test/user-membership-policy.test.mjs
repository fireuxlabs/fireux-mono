import { isAppUserRole } from '../runtime/app/models/app-user.model.ts'
import { userDisplayNameSeed } from '../runtime/user/utils/display-name-seed.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'

function load(path, name, dependencies) {
  dependencies = {
    userDisplayNameSeed,
    isAppUserRole,
    getCurrentScope: () => null,
    captureCommandScope: () => ({ isCurrent: () => true, stop() {} }),
    useCurrentUser: () => ({
      get value() {
        return dependencies.getAuth?.().currentUser ?? null
      },
    }),
    ...dependencies,
  }
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

test('App membership is created and validated without an onboarding completion flag', () => {
  const at = { seconds: 123, nanoseconds: 0 }
  const isAppUserSubscription = load(
    '../runtime/app/models/app-user.model.ts',
    'isAppUserSubscription',
    {}
  )
  const contract = load(
    '../runtime/app/server/app-user/command-contract.ts',
    '{ initialMembership, requireCanonicalMembership }',
    {
      FieldValue: { serverTimestamp: () => at },
      USER_MUTATION_TARGETS: { runtimeUsers: {} },
      isAppUserSubscription,
      createError: (value) =>
        Object.assign(new Error(value.statusMessage), value),
    }
  )
  const membership = contract.initialMembership('person', 'user')
  assert.deepEqual(membership, {
    role: 'user',
    subscription: 'free',
    created: { at, by: 'person' },
    updated: { at, by: 'person' },
  })
  assert.doesNotThrow(() => contract.requireCanonicalMembership(membership))
  assert.doesNotThrow(
    () =>
      contract.requireCanonicalMembership({
        ...membership,
        onboarding_status: 'pending',
      }),
    'historical data cannot add a completion requirement'
  )
  assert.throws(
    () =>
      contract.requireCanonicalMembership({ ...membership, role: 'invalid' }),
    { statusCode: 409 }
  )
})

function session(policy, outcome = 'ready') {
  const app = {
    app: ref({ self_join_enabled: policy }),
    outcome: ref(outcome),
    error: ref(null),
  }
  const auth = {
    uid: ref('user'),
    isAuthenticated: ref(true),
    hasAuthState: ref(true),
    currentUser: ref({}),
  }
  const make = load(
    '../runtime/user/composables/session/useUserSessionState.ts',
    'useUserSessionState',
    {
      computed,
      useFireUXConfig: () => ({ appId: 'runtime', selfJoinEnabled: !policy }),
      useAppJoinPolicy: load(
        '../runtime/app/composables/membership/useAppJoinPolicy.ts',
        'useAppJoinPolicy',
        {
          computed,
          unref,
          useAuth: () => auth,
          useFirestoreRead: () => ({
            firestoreFetchDoc: () =>
              Object.assign(app.app, {
                outcome: app.outcome,
                error: app.error,
              }),
          }),
        }
      ),
      useAuth: () => auth,
      useAvatarProxy: () => ({ getProxiedAvatarUrl: (value) => value }),
      useAppUserAccess: () => ({}),
    }
  )
  const user = {
    coreUser: ref({}),
    appUser: ref(null),
    coreOutcome: ref('ready'),
    coreError: ref(null),
    appError: ref(null),
    appPending: ref(false),
    appOutcome: ref('empty'),
  }
  const state = make(user)
  return { state, app, user, auth }
}

test('Stored policy controls joining even when build-time config disagrees', () => {
  const { state, app } = session(true)
  assert.equal(state.canSelfJoin.value, true)
  assert.equal(state.outcome.value, 'ready')
  assert.equal(state.pending.value, false)
  app.app.value.self_join_enabled = false
  assert.equal(state.canSelfJoin.value, false)
  assert.equal(state.outcome.value, 'ready')
})

test('Invalid App presentation metadata does not suppress a valid membership policy', () => {
  const { state, app } = session(true)
  app.app.value = {
    self_join_enabled: true,
    media: { logo_url: null },
    name: null,
  }
  assert.equal(state.canSelfJoin.value, true)
  assert.equal(state.outcome.value, 'ready')
  assert.equal(state.pending.value, false)
  app.app.value.self_join_enabled = false
  assert.equal(state.canSelfJoin.value, false)
  assert.equal(state.outcome.value, 'ready')
})

test('Policy loading and errors remain visible in session state', () => {
  const { state, app } = session(false, 'pending')
  assert.equal(state.outcome.value, 'loading')
  assert.equal(state.pending.value, true)
  app.outcome.value = 'error'
  app.error.value = new Error('Policy unavailable')
  assert.equal(state.outcome.value, 'error')
  assert.equal(state.pending.value, false)
  assert.equal(state.error.value, app.error.value)
  app.error.value = null
  app.outcome.value = 'ready'
  assert.equal(state.outcome.value, 'ready')
  assert.equal(state.pending.value, false)
  assert.ok(!state.error.value)
})

test('An uninitialized App does not require membership before developer setup', () => {
  const { state, app } = session(false, 'empty')
  app.app.value = null
  assert.equal(state.outcome.value, 'ready')
  assert.equal(state.pending.value, false)
  assert.equal(state.canSelfJoin.value, false)
})

for (const selfJoin of [false, true])
  test(`Membership loading and failure remain visible in ${selfJoin ? 'self-service' : 'invite-only'} Apps`, () => {
    const { state, user } = session(selfJoin)
    user.appUser.value = undefined
    user.appPending.value = true
    user.appOutcome.value = 'pending'
    assert.equal(state.outcome.value, 'loading')
    assert.equal(state.pending.value, true)
    user.appPending.value = false
    user.appOutcome.value = 'error'
    user.appError.value = new Error('Membership unavailable')
    assert.equal(state.outcome.value, 'error')
    assert.equal(state.pending.value, false)
    assert.equal(state.error.value, user.appError.value)
    user.appError.value = null
    user.appOutcome.value = 'ready'
    user.appUser.value = { id: 'user', role: 'member' }
    assert.equal(state.outcome.value, 'ready')
    assert.equal(state.pending.value, false)
    assert.ok(!state.error.value)
  })

test('Session pending follows auth and User resolution rather than one source alone', () => {
  const { state, user, auth } = session(false)
  auth.hasAuthState.value = false
  user.coreError.value = new Error('Previous identity failed')
  assert.equal(state.outcome.value, 'loading')
  assert.equal(state.pending.value, true)
  assert.ok(!state.error.value)
  user.coreError.value = null
  auth.hasAuthState.value = true
  user.coreOutcome.value = 'pending'
  assert.equal(state.outcome.value, 'loading')
  assert.equal(state.pending.value, true)
  user.coreOutcome.value = 'error'
  user.coreError.value = new Error('User unavailable')
  assert.equal(state.outcome.value, 'error')
  assert.equal(state.pending.value, false)
  assert.equal(state.error.value, user.coreError.value)
  user.coreError.value = null
  user.coreOutcome.value = 'empty'
  user.coreUser.value = null
  assert.equal(state.outcome.value, 'empty')
  assert.equal(state.pending.value, false)
  user.coreUser.value = { id: 'user' }
  user.coreOutcome.value = 'ready'
  assert.equal(state.outcome.value, 'ready')
  assert.ok(!state.error.value)
  auth.uid.value = null
  auth.isAuthenticated.value = false
  user.appError.value = new Error('Previous membership failed')
  assert.equal(state.outcome.value, 'unauthenticated')
  assert.equal(state.pending.value, false)
  assert.ok(!state.error.value)
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
    '../runtime/user/composables/identity/useUserBootstrap.ts',
    'useUserBootstrap',
    {
      doc: () => ({}),
      getDoc: async () => ({ exists: () => exists }),
      useFireUXConfig: () => ({ appId: 'runtime', selfJoinEnabled: seed }),
      useFirestore: () => ({}),
      requireUid: async () => ({
        uid: 'user',
        auth: { uid: 'user', getIdToken: async () => 'token' },
      }),
      getAuth: () => ({ currentUser: { uid: 'user' } }),
      provisionUserIdentity: async () => ({ created: true }),
      runAppUserCommand: async () => {
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
