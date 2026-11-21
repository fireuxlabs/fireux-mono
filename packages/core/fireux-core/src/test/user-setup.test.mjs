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
import { createJiti } from 'jiti'
const { isUserIdentityComplete, normalizeUser } = await createJiti(
  import.meta.url
).import('../runtime/user/utils/normalize-user.ts')
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../runtime/user/models/user-account-provisioning.ts'

const ready = {
  authResolved: true,
  signedIn: true,
  identity: 'ready',
  identityData: {
    id: 'person',
    handle: 'person',
    display_name: 'Person',
    bio: '',
    avatar: '/img/ecosystem/avatar.png',
  },
  account: 'ready',
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

const setupPath = 'user/composables/account/useUserSetup.ts'
const resolveUserSetup = load(setupPath, 'resolveUserSetup', {
  isUserIdentityComplete,
  FIREUX_ACCOUNT_TERMS_VERSION,
})
const useCommandScope = load(
  'composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)

function setupHarness({ accountData = ready.accountData } = {}) {
  const owner = effectScope()
  const currentUser = ref({ uid: 'person', isAnonymous: false })
  const config = reactive({ appId: 'app' })
  const route = reactive({ fullPath: '/users/create?redirect=%2Fdashboard' })
  const accounts = []
  const identities = []
  const useUserSetup = load(setupPath, 'useUserSetup', {
    computed,
    useCommandScope,
    useRoute: () => route,
    useFireUXConfig: () => config,
    useAuth: () => ({
      currentUser,
      uid: computed(() => currentUser.value?.uid),
      hasAuthState: ref(true),
      isAuthenticated: ref(true),
      isReady: ref(true),
    }),
    useUserRead: () => ({
      user: ref(null),
      outcome: ref('empty'),
      error: ref(null),
    }),
    useUserAccount: () => ({
      account: ref(accountData),
      outcome: ref(accountData ? 'ready' : 'empty'),
      error: ref(null),
    }),
    provisionSignedInUserAccount: (user, termsVersion) =>
      new Promise((resolve, reject) => {
        accounts.push({ uid: user.uid, termsVersion, resolve, reject })
      }),
    useUserBootstrap: () => ({
      bootstrapUser: async (user) => identities.push(user.uid),
    }),
    isUserIdentityComplete,
    FIREUX_ACCOUNT_TERMS_VERSION,
  })
  const setup = owner.run(useUserSetup)
  return { owner, currentUser, config, route, accounts, identities, setup }
}

test('account setup rejects missing consent before starting any writes', async (t) => {
  const h = setupHarness({ accountData: null })
  t.after(() => h.owner.stop())
  await assert.rejects(h.setup.complete(), /Accept the Terms/)
  assert.deepEqual(h.accounts, [])
  assert.deepEqual(h.identities, [])

  const completion = h.setup.complete(FIREUX_ACCOUNT_TERMS_VERSION)
  assert.equal(h.accounts[0].termsVersion, FIREUX_ACCOUNT_TERMS_VERSION)
  h.accounts[0].resolve()
  assert.equal(await completion, true)
  assert.deepEqual(h.identities, ['person'])
})

for (const change of ['none', 'account', 'app', 'route', 'disposal']) {
  test(`explicit setup owns its ${change} lifecycle and starts no writes on read`, async () => {
    const h = setupHarness()
    assert.deepEqual(h.accounts, [])
    assert.equal(h.setup.status.value.needsSetup, true)
    const pending = h.setup.complete()
    assert.equal(h.accounts.length, 1)
    assert.equal(h.accounts[0].termsVersion, undefined)
    if (change === 'account') h.currentUser.value = null
    if (change === 'app') h.config.appId = 'other'
    if (change === 'route') h.route.fullPath = '/home'
    if (change === 'disposal') h.owner.stop()
    h.accounts[0].resolve()
    assert.equal(await pending, change === 'none')
    assert.deepEqual(h.identities, change === 'none' ? ['person'] : [])
    h.owner.stop()
  })
}

test('overlapping setup clicks share one operation, including before reads catch up', async (t) => {
  const h = setupHarness()
  t.after(() => h.owner.stop())
  const first = h.setup.complete()
  const duplicate = h.setup.complete()
  assert.equal(h.accounts.length, 1)
  h.accounts[0].resolve()
  assert.deepEqual(await Promise.all([first, duplicate]), [true, true])
  assert.equal(await h.setup.complete(), true)
  assert.equal(h.accounts.length, 1)
  assert.deepEqual(h.identities, ['person'])
})

for (const staleFailure of [false, true]) {
  test(`same-account sign-out and sign-in invalidate old setup ${staleFailure ? 'failure' : 'success'}`, async (t) => {
    const h = setupHarness()
    t.after(() => h.owner.stop())
    const actor = h.currentUser.value
    const old = h.setup.complete()
    h.currentUser.value = null
    h.currentUser.value = actor
    const current = h.setup.complete()
    if (staleFailure) h.accounts[0].reject(new Error('Old request failed'))
    else h.accounts[0].resolve()
    assert.equal(await old, false)
    assert.deepEqual(h.identities, [])
    h.accounts[1].resolve()
    assert.equal(await current, true)
    assert.deepEqual(h.identities, ['person'])
  })
}

test('a current setup error is returned and an explicit retry can finish', async (t) => {
  const h = setupHarness()
  t.after(() => h.owner.stop())
  const initial = h.setup.complete()
  const failure = new Error('Account unavailable')
  h.accounts[0].reject(failure)
  await assert.rejects(initial, failure)
  const retry = h.setup.complete()
  h.accounts[1].resolve()
  assert.equal(await retry, true)
  assert.deepEqual(h.identities, ['person'])
})

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

test('App membership never affects completed User setup', () => {
  for (const membership of ['empty', 'pending', 'error', 'ready']) {
    const status = resolveUserSetup({ ...ready, membership })
    assert.equal(status.needsSetup, false)
    assert.equal(status.requiresConsent, false)
    assert.equal(status.pending, false)
    assert.equal(status.failed, false)
  }
})

test('a ready but incomplete User still requires identity completion', () => {
  for (const identityData of [
    undefined,
    null,
    { ...ready.identityData, handle: '' },
    { ...ready.identityData, handle: '!' },
    { ...ready.identityData, display_name: '' },
    { ...ready.identityData, display_name: '   ' },
    { ...ready.identityData, display_name: 'x'.repeat(121) },
  ]) {
    const status = resolveUserSetup({ ...ready, identityData })
    assert.equal(status.requiresConsent, false)
    assert.equal(status.needsSetup, true)
  }
})

test('malformed stored identity fields remain editable and cannot finish setup', () => {
  for (const key of ['handle', 'display_name']) {
    for (const value of [123, { name: 'Person' }]) {
      const identityData = normalizeUser('person', {
        ...ready.identityData,
        [key]: value,
        bio: { text: 'Bio' },
      })
      assert.equal(identityData.id, 'person')
      assert.equal(identityData[key], '')
      assert.equal(identityData.bio, '')
      assert.equal(
        resolveUserSetup({ ...ready, identityData }).needsSetup,
        true
      )
    }
  }
})

test('new Users need identity and consent', () => {
  const status = resolveUserSetup({
    ...ready,
    identity: 'empty',
    account: 'empty',
    accountData: null,
  })
  assert.equal(status.requiresConsent, true)
  assert.equal(status.needsSetup, true)
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
  for (const key of ['identity', 'account']) {
    for (const outcome of ['idle', 'pending', 'error']) {
      const status = resolveUserSetup({ ...ready, [key]: outcome })
      assert.equal(status.pending, outcome !== 'error')
      assert.equal(status.failed, outcome === 'error')
      assert.equal(status.needsSetup, false)
    }
  }
})
