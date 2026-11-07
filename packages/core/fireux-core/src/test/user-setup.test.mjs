import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  onScopeDispose,
  reactive,
  ref,
  watch,
} from 'vue'
import { resolveUserSetup } from '../runtime/user/utils/user-setup.ts'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../runtime/user/models/user-account-provisioning.ts'

const ready = {
  authResolved: true,
  signedIn: true,
  identity: 'ready',
  account: 'ready',
  membership: 'ready',
  accountData: {
    terms: {
      version: FIREUX_ACCOUNT_TERMS_VERSION,
      accepted_at: { seconds: 1 },
    },
  },
}

function load(path, name, dependencies) {
  const code = readFileSync(
    new URL('../runtime/' + path, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
  return compileFunction(
    stripTypeScriptTypes(code) + '; return ' + name,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

for (const change of ['none', 'account', 'app', 'route', 'disposal']) {
  test(`explicit setup owns its ${change} lifecycle and starts no writes on read`, async () => {
    const owner = effectScope()
    const currentUser = ref({ uid: 'person', isAnonymous: false })
    const config = reactive({ appId: 'app' })
    const route = reactive({ fullPath: '/users/create?redirect=%2Fworkspace' })
    const calls = []
    let finishAccount
    const createUserSetupCoordinator = load(
      'user/composables/account/user-setup-coordinator.ts',
      'createUserSetupCoordinator',
      {
        computed,
        provisionSignedInUserAccount: (_user, termsVersion) => {
          calls.push(['account', termsVersion])
          return new Promise((resolve) => {
            finishAccount = resolve
          })
        },
      }
    )
    const useUserSetup = load(
      'user/composables/account/useUserSetup.ts',
      'useUserSetup',
      {
        computed,
        ref,
        watch,
        onScopeDispose,
        useRoute: () => route,
        useFireUXConfig: () => config,
        useAuth: () => ({
          currentUser,
          hasAuthState: ref(true),
          isAuthenticated: ref(true),
          isReady: ref(true),
        }),
        useUserSession: () => ({
          coreOutcome: ref('ready'),
          appOutcome: ref('empty'),
          coreError: ref(null),
          appError: ref(null),
        }),
        useUserAccount: () => ({
          account: ref(ready.accountData),
          outcome: ref('ready'),
          error: ref(null),
        }),
        useUserBootstrap: () => ({
          bootstrapUser: async () => {
            calls.push(['bootstrap'])
          },
        }),
        createUserSetupCoordinator,
        resolveUserSetup,
      }
    )
    const setup = owner.run(useUserSetup)
    assert.deepEqual(calls, [])
    assert.equal(setup.status.value.requiresMembership, true)
    const pending = setup.complete()
    assert.deepEqual(calls, [['account', undefined]])
    if (change === 'account') currentUser.value = null
    if (change === 'app') config.appId = 'other'
    if (change === 'route') route.fullPath = '/home'
    if (change === 'disposal') owner.stop()
    finishAccount()
    assert.equal(await pending, change === 'none')
    assert.deepEqual(
      calls,
      change === 'none'
        ? [['account', undefined], ['bootstrap']]
        : [['account', undefined]]
    )
    owner.stop()
  })
}

test('private-account creation stores only real account facts and preserves recorded consent', async () => {
  const writes = []
  let existing = false
  const timestamp = { seconds: 1, nanoseconds: 0 }
  const provision = load(
    'user/server/user-account/provision.ts',
    'provisionUserAccount',
    {
      FieldValue: { serverTimestamp: () => timestamp },
      FIREUX_ACCOUNT_TERMS_VERSION,
      UserAccountStorage: { document: 'account' },
      USER_MUTATION_TARGETS: { users: 'users' },
      serverUserAccountTarget: () => ({ database: 'identity' }),
      createError: (value) =>
        Object.assign(new Error(value.statusMessage), value),
      runGuardedServerTransaction: async (_database, run) =>
        run({
          read: async (target) =>
            target === 'users'
              ? { exists: existing }
              : {
                  exists: existing,
                  data: {
                    email: 'person@example.test',
                    terms: ready.accountData.terms,
                  },
                },
          create: (_target, _id, data) => writes.push(data),
          update: () => assert.fail('Existing account facts were rewritten'),
        }),
    }
  )
  await provision({
    uid: 'person',
    email: 'person@example.test',
    emailVerified: true,
    termsVersion: FIREUX_ACCOUNT_TERMS_VERSION,
  })
  assert.deepEqual(Object.keys(writes[0]).sort(), [
    'created',
    'email',
    'terms',
    'updated',
  ])
  assert.equal(writes[0].terms.version, FIREUX_ACCOUNT_TERMS_VERSION)
  existing = true
  const result = await provision({
    uid: 'person',
    email: 'person@example.test',
    emailVerified: true,
  })
  assert.equal(result.created, false)
  assert.equal(result.terms_recorded, true)
  assert.equal(writes.length, 1)
})

test('an existing User joins another App without another identity or consent step', () => {
  const status = resolveUserSetup({ ...ready, membership: 'empty' })
  assert.equal(status.needsSetup, true)
  assert.equal(status.requiresMembership, true)
  assert.equal(status.requiresIdentity, false)
  assert.equal(status.requiresConsent, false)
})

test('new Users need identity, consent and membership; completed Users need none', () => {
  const status = resolveUserSetup({
    ...ready,
    identity: 'empty',
    account: 'empty',
    membership: 'empty',
    accountData: null,
  })
  assert.equal(status.requiresConsent, true)
  assert.equal(status.requiresIdentity, true)
  assert.equal(status.requiresMembership, true)
  assert.equal(resolveUserSetup(ready).needsSetup, false)
})

test('an existing public identity does not hide a missing private account or consent', () => {
  for (const accountData of [
    null,
    { terms: { version: '', accepted_at: null } },
    { terms: { version: 'previous', accepted_at: { seconds: 1 } } },
  ]) {
    assert.equal(
      resolveUserSetup({ ...ready, accountData }).requiresConsent,
      true
    )
  }
})

test('guest Workspace access does not require User setup', () => {
  const status = resolveUserSetup({
    ...ready,
    signedIn: false,
    identity: 'idle',
    account: 'idle',
    membership: 'idle',
    accountData: null,
  })
  assert.equal(status.pending, false)
  assert.equal(status.needsSetup, false)
})

test('unresolved and failed reads never become completed setup or a missing-record decision', () => {
  assert.equal(
    resolveUserSetup({ ...ready, authResolved: false }).pending,
    true
  )
  for (const key of ['identity', 'account', 'membership']) {
    for (const outcome of ['idle', 'pending', 'error']) {
      const status = resolveUserSetup({ ...ready, [key]: outcome })
      assert.equal(status.pending, outcome !== 'error')
      assert.equal(status.failed, outcome === 'error')
      assert.equal(status.needsSetup, false)
    }
  }
})
