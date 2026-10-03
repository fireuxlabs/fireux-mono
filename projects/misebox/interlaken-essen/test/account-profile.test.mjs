import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, effectScope, nextTick, ref, watch } from 'vue'

function load(path, result, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const content = load(
  '../app/content/marketplace-profile.ts',
  '{ INTERLAKEN_ESSEN_APP_ID, INTERLAKEN_LOCALITIES, OTHER_LOCALITY_ID, MARKETPLACE_PROFILE_KIND, marketplaceProfilePath, marketplaceProfileAppStatePath }'
)
const profile = {
  locality_id: 'interlaken',
  locality_label: 'Interlaken',
  postal_code: '3800',
  offers_enabled: true,
  public_name: 'Local bread',
  introduction: 'Fresh bread baked each morning.',
}
const accountValue = () => ({
  ok: true,
  settings: { delivery_address: 'Old address' },
  profile: { ...profile },
})

function serverFixture({
  role = 'user',
  memberExists = true,
  input,
  appState = {},
  profileExists = true,
} = {}) {
  const writes = []
  const membershipPath = 'apps/interlaken-essen/users/person'
  const statePath = content.marketplaceProfileAppStatePath('person')
  const records = new Map([
    [
      membershipPath,
      { exists: memberExists, role, onboarding_status: 'pending' },
    ],
    [content.marketplaceProfilePath('person'), { exists: profileExists }],
    [statePath, { exists: true, ...appState }],
  ])
  const snapshot = (path) => ({
    exists: records.get(path)?.exists ?? false,
    get: (field) => {
      assert.notEqual(
        field,
        'onboarding_status',
        'account reads no completion flag'
      )
      return records.get(path)?.[field]
    },
  })
  const db = {
    doc: (path) => ({ path, get: async () => snapshot(path) }),
    runTransaction: async (callback) =>
      callback({
        get: async ({ path }) => {
          assert.equal(writes.length, 0, 'reads precede all writes')
          return snapshot(path)
        },
        create: ({ path }, value) =>
          writes.push({ action: 'create', path, value }),
        set: ({ path }, value, options) =>
          writes.push({ action: 'set', path, value, options }),
        update: ({ path }) => {
          throw new Error(`Unexpected membership update: ${path}`)
        },
      }),
  }
  const deps = {
    ...content,
    useRuntimeConfig: () => ({
      public: { fireux: { id: 'interlaken-essen' } },
    }),
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    requireFirebaseBearerUser: async () => ({ uid: 'person' }),
    getRuntimeFirestore: () => db,
    defineLiveReadHandler: (handler) => handler,
    defineEventHandler: (handler) => handler,
    readBody: async () => input,
    serverAuditStamp: () => ({}),
    FieldValue: { delete: () => 'DELETE_FIELD' },
  }
  return {
    writes,
    membershipPath,
    statePath,
    read: () =>
      load('../server/api/marketplace/account.get.ts', 'handler', deps)({}),
    save: () =>
      load('../server/api/marketplace/profile.post.ts', 'handler', deps)({}),
  }
}

test('live account response supplies saved profile and address without reading a completion flag', async () => {
  const f = serverFixture({
    appState: {
      locality: { id: 'interlaken', label: 'Interlaken', postal_code: '3800' },
      offers_enabled: true,
      public_name: profile.public_name,
      introduction: profile.introduction,
      delivery_address: ' Address ',
    },
  })
  const value = await f.read()
  assert.deepEqual(value.profile, profile)
  assert.equal(value.settings.delivery_address, 'Address')
  assert.equal('membership' in value, false)
  assert.equal(f.writes.length, 0)
})

test('a member without profile details receives an editable empty profile', async () => {
  const value = await serverFixture().read()
  assert.deepEqual(value.profile, {
    locality_id: '',
    locality_label: '',
    postal_code: '',
    offers_enabled: false,
    public_name: '',
    introduction: '',
  })
})

test('profile save keeps membership as authority and writes only profile data', async () => {
  const f = serverFixture({
    profileExists: false,
    input: {
      locality_id: 'interlaken',
      offers_enabled: true,
      public_name: ' Local bread ',
      introduction: profile.introduction,
    },
  })
  assert.deepEqual(await f.save(), { ok: true })
  assert.equal(f.writes.length, 2)
  assert.equal(f.writes[0].action, 'create')
  const update = f.writes[1]
  assert.equal(update.path, f.statePath)
  assert.deepEqual(update.options, { merge: true })
  assert.deepEqual(update.value.locality, {
    id: 'interlaken',
    label: 'Interlaken',
    postal_code: '3800',
  })
  assert.equal(update.value.public_name, 'Local bread')
  assert.equal('delivery_address' in update.value, false)
  assert.equal('onboarding_status' in update.value, false)
})

test('profile edit can disable offers without deleting address or locality', async () => {
  const f = serverFixture({
    input: {
      locality_id: 'other',
      locality_label: 'Mürren',
      postal_code: '3825',
      offers_enabled: false,
    },
  })
  await f.save()
  assert.equal(f.writes.length, 1)
  assert.equal(f.writes[0].value.public_name, 'DELETE_FIELD')
  assert.equal(f.writes[0].value.introduction, 'DELETE_FIELD')
  assert.equal('delivery_address' in f.writes[0].value, false)
  assert.equal(f.writes[0].value.locality.postal_code, '3825')
})

test('profile mutation rejects invalid input and absent membership before any writes', async () => {
  for (const options of [
    {
      memberExists: false,
      input: { locality_id: 'interlaken', offers_enabled: false },
    },
    {
      role: 'guest',
      input: { locality_id: 'interlaken', offers_enabled: false },
    },
    {
      input: {
        locality_id: 'other',
        locality_label: 'Mürren',
        postal_code: 'bad',
        offers_enabled: false,
      },
    },
    {
      input: {
        locality_id: 'interlaken',
        offers_enabled: true,
        public_name: 'x',
        introduction: 'short',
      },
    },
    {
      input: {
        locality_id: 'interlaken',
        offers_enabled: false,
        onboarding_status: 'completed',
      },
    },
  ]) {
    const f = serverFixture(options)
    await assert.rejects(f.save())
    assert.equal(f.writes.length, 0)
  }
  await assert.rejects(
    serverFixture({ memberExists: false }).read(),
    (error) => error.statusCode === 403
  )
})

test('explicit editor starts from saved values and preserves a failed draft', async () => {
  const calls = []
  let fail = true
  const auth = ref({
    uid: 'person',
    displayName: 'Person',
    getIdToken: async () => 'token',
  })
  const saved = { ...profile }
  const useProfile = load(
    '../app/composables/useMarketplaceProfile.ts',
    'useMarketplaceProfile',
    {
      ...content,
      computed,
      ref,
      watch,
      useInterlakenCopy: () => ({ copy: (key) => key }),
      useAuth: () => ({ currentUser: auth }),
      useUserSession: () => ({ avatarSrc: ref('') }),
      useAvatarProxy: () => ({ getProxiedAvatarUrl: (value) => value }),
      $fetch: async (url, options) => {
        calls.push({ url, options })
        if (fail) throw new Error('offline')
        return { ok: true }
      },
    }
  )
  const scope = effectScope()
  const editor = scope.run(() => useProfile(saved))
  assert.equal(calls.length, 0)
  assert.equal(editor.localityId.value, profile.locality_id)
  assert.equal(editor.publicName.value, profile.public_name)
  saved.public_name = 'A remote change'
  assert.equal(editor.publicName.value, profile.public_name)
  editor.publicName.value = 'My draft'
  assert.equal(await editor.saveProfile(), false)
  assert.equal(editor.publicName.value, 'My draft')
  assert.equal(editor.errorKey.value, 'profile_error_save_retry')
  fail = false
  assert.equal(await editor.saveProfile(), true)
  assert.equal(calls[1].url, '/api/marketplace/profile')
  assert.equal(calls[1].options.body.public_name, 'My draft')
  assert.equal('onboarding_status' in calls[1].options.body, false)
  auth.value = { uid: 'other-person', getIdToken: async () => 'other-token' }
  assert.equal(await editor.saveProfile(), false)
  assert.equal(
    calls.length,
    2,
    'an account switch cannot submit the previous draft'
  )
  assert.equal(editor.errorKey.value, 'profile_error_auth')
  scope.stop()
})

test('/mis reads account once live, never opens a profile automatically, and keeps orders and address editing', async () => {
  const calls = [],
    transitions = []
  const auth = ref({
    uid: 'person',
    displayName: 'Person',
    getIdToken: async () => 'token',
  })
  const account = {
    data: ref(accountValue()),
    pending: ref(false),
    error: ref(undefined),
  }
  const records = {
    data: ref({ stores: [{ id: 'store' }], orders: [{ id: 'order' }] }),
    pending: ref(false),
    error: ref(undefined),
    refresh: async () => {},
  }
  let reads = 0
  const usePersonal = load(
    '../app/composables/usePersonalMarketplace.ts',
    'usePersonalMarketplace',
    {
      computed,
      ref,
      watch,
      useInterlakenCopy: () => ({ copy: (key) => key, locale: ref('en-GB') }),
      useWorkspaceEntryState: () => ({ authPhase: ref('authenticated') }),
      useUserSession: () => ({
        currentUser: ref({ display_name: 'Person' }),
        avatarSrc: ref(''),
      }),
      useAuth: () => ({ currentUser: auth }),
      useAvatarProxy: () => ({ getProxiedAvatarUrl: (value) => value }),
      useMarketplaceCommands: () => ({
        captureIntent: () => () => true,
        scopeEpoch: ref(0),
        transitionOrder: async (...args) => transitions.push(args),
      }),
      useLiveAsyncData: (key) => {
        reads += 1
        return key.value.startsWith('market-account:') ? account : records
      },
      $fetch: async (url, options) => {
        calls.push({ url, options })
        return { ok: true, settings: options.body }
      },
    }
  )
  const scope = effectScope()
  const personal = scope.run(usePersonal)
  assert.equal(
    reads,
    2,
    'one account subscription and one existing records subscription'
  )
  assert.equal(calls.length, 0)
  assert.equal(personal.profileEditorOpen.value, false)
  assert.equal(personal.deliveryAddress.value, 'Old address')
  assert.equal(personal.sellerEnabled.value, true)
  account.data.value = {
    ...accountValue(),
    settings: { delivery_address: 'New address' },
  }
  await nextTick()
  assert.equal(personal.deliveryAddress.value, 'New address')
  personal.deliveryAddress.value = 'Draft address'
  account.data.value = {
    ...accountValue(),
    settings: { delivery_address: 'Remote address' },
  }
  await nextTick()
  assert.equal(personal.deliveryAddress.value, 'Draft address')
  await personal.saveSettings()
  assert.equal(calls[0].url, '/api/marketplace/account')
  assert.equal(calls[0].options.method, 'PATCH')
  assert.equal(calls[0].options.body.delivery_address, 'Draft address')
  await personal.cancelBuyerOrder('order')
  assert.deepEqual(transitions, [['order', 'cancelled']])
  records.data.value = { stores: [], orders: [] }
  assert.equal(personal.sellerEnabled.value, false)
  personal.profileEditorOpen.value = true
  auth.value = null
  assert.equal(
    personal.profileEditorOpen.value,
    false,
    'account change closes synchronously'
  )
  await nextTick()
  assert.equal(personal.accountProfile.value, null)
  assert.deepEqual(personal.buyerOrders.value, [])
  scope.stop()
})
