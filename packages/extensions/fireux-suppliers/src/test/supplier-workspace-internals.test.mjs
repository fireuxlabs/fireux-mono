import assert from 'node:assert/strict'
import { placeIdentityMedia } from '../../../fireux-places/src/runtime/place/utils/place-identity-media.ts'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  ref,
  reactive,
  watch,
  onScopeDispose,
  effectScope,
  nextTick,
  unref,
} from 'vue'
import { normalizeSupplier } from '../runtime/supplier/utils/normalize-supplier.ts'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'
import { isFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts'
import { normalizeString } from '../../../../core/fireux-core/src/runtime/utils/string.ts'

function load(file, result, deps = {}) {
  let source = readFileSync(new URL(file, import.meta.url), 'utf8')
  if (source.includes('<script setup'))
    source = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export(?: type)? \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replace(/import\.meta\.server/g, 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source, { mode: 'transform' })};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const core = '../../../../core/fireux-core/src/runtime/'
const normalizeSlug = load(
  `${core}utils/slug/normalizeSlug.ts`,
  'normalizeSlug',
  { normalizeString }
)
const useCommandScope = load(
  `${core}composables/fireux/commands/useCommandScope.ts`,
  'useCommandScope',
  { watch, onScopeDispose }
)
const normalizePlace = load(
  '../../../fireux-places/src/runtime/place/utils/normalize-place.ts',
  'normalizePlace',
  {
    isFirestoreDocumentId,
    readBrandPalette: () => ({}),
    normalizePlaceBusinessHours: () => null,
    readMediaBackdropColor: () => '',
  }
)
const surface = load(
  '../runtime/supplier/composables/firestore/utils/view/useSupplierInterface.ts',
  'useSupplierInterface()',
  {
    normalizeSupplier,
    placeIdentityMedia,
    SupplierStorage: { collection: 'suppliers' },
    safeString: (value) => String(value ?? ''),
    safeStringArray: (value) => (Array.isArray(value) ? value : []),
    csv: (value) => value.join(', '),
  }
)
const stamp = { at: { seconds: 1, nanoseconds: 0 }, by: 'actor' }
const root = (id = 'Supplier-A', companyId = 'Company-A') => ({
  id,
  company_id: companyId,
  management: { mode: 'workspace' },
  identity: { slug: id, status: 'inactive', visibility: false },
  catalogue: { mode: 'directory_only' },
  delivery: { areas: [] },
  created: stamp,
  updated: stamp,
})
const flush = async () => {
  for (let i = 0; i < 4; i++) await nextTick()
}

test('granted collection follows exact linked Place identity, rebinding, removal, errors, revocation and disposal', async () => {
  const scope = effectScope(),
    ids = ref(new Set(['Supplier-A'])),
    created = [],
    stopped = []
  const records = reactive({
    'suppliers/Supplier-A': root(),
    'places/Company-A': {
      name: 'Original',
      place_type: 'non_physical',
      image_url: 'original.webp',
    },
    'places/Company-B': {
      name: 'Replacement',
      place_type: 'non_physical',
      image_url: 'replacement.webp',
    },
  })
  const errors = reactive({})
  const createLoader = load(
    `${core}composables/fireux/firestore/operations/firestore-exact-doc-loader.ts`,
    'createFirestoreExactDocLoader',
    {
      computed,
      ref,
      unref,
      watch,
      effectScope,
      doc: (_db, collection, id) => `${collection}/${id}`,
      useDocument: (key) => {
        created.push(key)
        onScopeDispose(() => stopped.push(key))
        const binding = computed(() => records[key])
        binding.pending = ref(false)
        binding.error = computed(() => errors[key])
        return binding
      },
      guardFirestorePromise() {},
      attachDevCollectionMeta: (value) => value,
    }
  )
  const bindings = []
  const api = scope.run(() =>
    load(
      '../runtime/supplier/composables/useSupplierCollection.ts',
      'useSupplierCollection()',
      {
        computed,
        normalizePlace,
        useSupplierInterface: () => surface,
        useSupplierCollectionSelection: () => ({
          sourceMode: ref('live'),
          hasFilter: ref(true),
          filterIdSet: ids,
          usesTargetedRootRead: ref(true),
        }),
        useFirestoreRead: () => ({
          firestoreLoadDocsByIds: (options) => {
            bindings.push(options)
            return createLoader({ resolveDb: () => ({}), options })
          },
        }),
        useLiveAsyncData: () => ({
          data: ref(null),
          pending: ref(false),
          error: ref(null),
        }),
        DEFAULT_COLLECTION_PATH: 'suppliers',
        UNSUPPORTED_TEST_SOURCE_MESSAGE: 'Unsupported',
        resolveSupplierId: (value) => value.id,
        useFirestoreCollectionState: (options) => ({
          outcome: computed(() =>
            resolveReadOutcome({
              enabled: options.active.value,
              pending: options.pending.value,
              failed: Boolean(options.error.value),
              present: options.count.value > 0,
            })
          ),
        }),
      }
    )
  )
  await flush()
  assert.equal(api.outcome.value, 'ready')
  assert.equal(surface.pill(api.suppliers.value[0]).title, 'Original')
  assert.equal(surface.pill(api.suppliers.value[0]).imageUrl, 'original.webp')
  assert.equal(api.suppliers.value[0].identity.visibility, false)
  assert.deepEqual(api.roots.value, [normalizeSupplier('Supplier-A', root())])
  assert.equal('company_place' in api.roots.value[0], false)
  assert.equal(bindings.length, 2, 'both source constructors are setup-owned')
  records['places/Company-A'].name = 'Live edit'
  await flush()
  assert.equal(surface.pill(api.suppliers.value[0]).title, 'Live edit')
  records['suppliers/Supplier-A'].company_id = 'Company-B'
  await flush()
  assert.equal(surface.pill(api.suppliers.value[0]).title, 'Replacement')
  assert.ok(stopped.includes('places/Company-A'))
  assert.deepEqual(bindings[1].ids.value, ['Company-B'])
  delete records['places/Company-B']
  await flush()
  assert.equal(
    api.outcome.value,
    'ready',
    'a missing linked Place must not remove the granted root'
  )
  assert.equal(api.suppliers.value[0].company_place, undefined)
  records['places/Company-B'] = {
    name: 'Reappeared',
    place_type: 'non_physical',
  }
  await flush()
  assert.equal(surface.pill(api.suppliers.value[0]).title, 'Reappeared')
  errors['places/Company-B'] = Error('denied')
  await flush()
  assert.equal(api.outcome.value, 'error')
  assert.deepEqual(api.suppliers.value, [])
  assert.deepEqual(api.places.value, [])
  delete errors['places/Company-B']
  await flush()
  assert.equal(api.outcome.value, 'ready')
  records['places/Company-B'] = { name: 'Malformed', place_type: 'invalid' }
  await flush()
  assert.equal(api.outcome.value, 'error')
  assert.match(api.error.value.message, /invalid linked Place/)
  ids.value = new Set()
  await flush()
  assert.equal(api.outcome.value, 'empty')
  assert.deepEqual(api.suppliers.value, [])
  assert.deepEqual(bindings[1].ids.value, [])
  assert.ok(stopped.includes('suppliers/Supplier-A'))
  ids.value = new Set(['Supplier-A'])
  records['places/Company-B'] = { name: 'Restored', place_type: 'non_physical' }
  await flush()
  assert.equal(api.outcome.value, 'ready')
  scope.stop()
  assert.equal(
    stopped.length,
    created.length,
    'all root and linked identity listeners dispose with setup'
  )
})

test('targeted workspace collections use a different live-data key from the public directory', () => {
  const keys = []
  for (const targeted of [false, true]) {
    load(
      '../runtime/supplier/composables/useSupplierCollection.ts',
      'useSupplierCollection()',
      {
        computed,
        normalizePlace,
        useSupplierInterface: () => surface,
        useSupplierCollectionSelection: () => ({
          sourceMode: ref('live'),
          hasFilter: ref(targeted),
          filterIdSet: ref(new Set()),
          usesTargetedRootRead: ref(targeted),
        }),
        useFirestoreRead: () => ({
          firestoreLoadDocsByIds: () => ({
            docs: ref([]),
            pending: ref(false),
            error: ref(null),
          }),
        }),
        useLiveAsyncData: (key) => {
          keys.push(unref(key))
          return { data: ref(null), pending: ref(false), error: ref(null) }
        },
        DEFAULT_COLLECTION_PATH: 'suppliers',
        UNSUPPORTED_TEST_SOURCE_MESSAGE: 'Unsupported',
        resolveSupplierId: (value) => value.id,
        useFirestoreCollectionState: () => ({ outcome: ref('empty') }),
      }
    )
  }
  assert.notEqual(keys[0], keys[1])
})

test('Supplier access reports an App or grant error even when the other source is pending', () => {
  const app = {
    uid: ref('actor'),
    appUser: ref({}),
    pending: ref(true),
    error: ref(null),
  }
  const grant = {
    ids: ref(['Supplier-A']),
    pending: ref(false),
    error: ref(Error('denied')),
  }
  const api = load(
    '../runtime/supplier/composables/useSupplierAccess.ts',
    'useSupplierAccess()',
    {
      computed,
      useAppSession: () => app,
      useFireUXConfig: () => ({ appId: 'app' }),
      useMembershipAccess: () => grant,
      supplierAccessCollection: (id) => id,
    }
  )
  assert.equal(api.outcome.value, 'error')
  assert.deepEqual(api.ids.value, [])
  app.pending.value = false
  app.error.value = Error('App failed')
  grant.pending.value = true
  grant.error.value = null
  assert.equal(api.outcome.value, 'error')
  assert.deepEqual(api.ids.value, [])
})

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function createHarness() {
  const credentials = deferred(),
    token = deferred(),
    response = deferred(),
    scope = effectScope(),
    calls = []
  const user = { uid: 'actor', getIdToken: () => token.promise },
    currentUser = ref(user),
    appUser = ref({ created: { at: 1 } })
  const config = reactive({ appId: 'app' }),
    route = reactive({ fullPath: '/workspace/supplier/create' }),
    owner = ref('current')
  const api = scope.run(() =>
    load(
      '../runtime/supplier/composables/firestore/mutations/useSupplierCreate.ts',
      'useSupplierCreate()',
      {
        useCommandScope,
        useAuth: () => ({ currentUser }),
        useAppSession: () => ({ appUser }),
        useFireUXConfig: () => config,
        useRoute: () => route,
        defineFireuxCreatePlan: (value) => value,
        useRequireUser: () => credentials.promise,
        isFirestoreDocumentId,
        normalizeSlug,
        $fetch: (url, options) => {
          calls.push({ url, options })
          return response.promise
        },
      }
    )
  )
  const options = {
    organizationName: 'Imkerei Thöni',
    companyId: 'Company-A',
    isCurrent: scope.run(() => useCommandScope([owner]))(),
  }
  const result = {
    ok: true,
    supplier_id: 'imkerei-thoeni',
    action: 'create',
    created_root: true,
    created_team_member: true,
  }
  return {
    api,
    options,
    result,
    user,
    credentials,
    token,
    response,
    calls,
    scope,
    currentUser,
    appUser,
    config,
    route,
    owner,
  }
}
const drain = async () => {
  for (let i = 0; i < 4; i++) await Promise.resolve()
}
for (const stage of ['credentials', 'token'])
  for (const changed of [
    'account',
    'membership',
    'app',
    'route',
    'owner',
    'dispose',
  ]) {
    test(`Supplier creation blocks ${changed} changes before dispatch at ${stage}`, async () => {
      const h = createHarness(),
        pending = h.api.createSupplierWorkspace(h.options)
      if (stage === 'token') {
        h.credentials.resolve(h.user)
        await drain()
      }
      if (changed === 'account') {
        h.currentUser.value = { uid: 'other' }
        h.currentUser.value = h.user
      }
      if (changed === 'membership') {
        h.appUser.value = { created: { at: 2 } }
      }
      if (changed === 'app') {
        h.config.appId = 'other'
        h.config.appId = 'app'
      }
      if (changed === 'route') {
        h.route.fullPath = '/other'
        h.route.fullPath = '/workspace/supplier/create'
      }
      if (changed === 'owner') {
        h.owner.value = 'changed'
        h.owner.value = 'current'
      }
      if (changed === 'dispose') h.scope.stop()
      h.credentials.resolve(h.user)
      h.token.resolve('token')
      h.response.resolve(h.result)
      await assert.rejects(pending, /context changed/)
      assert.equal(h.calls.length, 0)
      h.scope.stop()
    })
  }

test('Supplier creation captures the submitted fields and returns a committed result after later navigation', async () => {
  const h = createHarness(),
    pending = h.api.createSupplierWorkspace(h.options)
  h.options.organizationName = 'Changed'
  h.options.companyId = 'Other'
  h.credentials.resolve(h.user)
  h.token.resolve('token')
  await drain()
  assert.equal(h.calls.length, 1)
  assert.deepEqual(h.calls[0].options.body, {
    organization_name: 'Imkerei Thöni',
    company_id: 'Company-A',
  })
  h.route.fullPath = '/other'
  h.response.resolve(h.result)
  assert.deepEqual(await pending, {
    id: 'imkerei-thoeni',
    createdRoot: true,
    createdTeamMember: true,
  })
  h.scope.stop()
})

for (const result of [
  { supplier_id: 'other' },
  { supplier_id: 123 },
  { created_root: 'yes' },
  { created_team_member: undefined },
  { action: 'invalid' },
])
  test(`Supplier creation rejects malformed completion ${JSON.stringify(result)}`, async () => {
    const h = createHarness(),
      pending = h.api.createSupplierWorkspace(h.options)
    h.credentials.resolve(h.user)
    h.token.resolve('token')
    h.response.resolve({ ...h.result, ...result })
    await assert.rejects(pending, /completion was invalid/)
    h.scope.stop()
  })

test('Supplier creation preserves an exact existing document ID for idempotent open', async () => {
  const h = createHarness(),
    pending = h.api.createSupplierWorkspace({ existingRootId: 'Supplier-A' })
  h.credentials.resolve(h.user)
  h.token.resolve('token')
  h.response.resolve({
    ...h.result,
    supplier_id: 'Supplier-A',
    action: 'open',
    created_root: false,
    created_team_member: false,
  })
  assert.deepEqual(await pending, {
    id: 'Supplier-A',
    createdRoot: false,
    createdTeamMember: false,
  })
  assert.deepEqual(h.calls[0].options.body, { supplier_id: 'Supplier-A' })
  h.scope.stop()
})

test('Supplier Create passes its full draft scope into the command and suppresses obsolete success feedback', async () => {
  const scope = effectScope(),
    currentUser = ref({ uid: 'actor' }),
    session = { appUser: ref({}) },
    route = reactive({ fullPath: '/workspace/supplier/create' })
  const flight = deferred(),
    effects = []
  let submitted
  const state = scope.run(() =>
    load(
      '../runtime/supplier/components/Create/Write.vue',
      '({ handleCreate, organizationName, companyId, isCreating, errorMessage })',
      {
        computed,
        ref,
        watch,
        useCommandScope,
        useAuth: () => ({ currentUser }),
        useAppSession: () => session,
        useFireUXConfig: () => ({ appId: 'app' }),
        useRoute: () => route,
        useRouter: () => ({ push: (path) => effects.push(path) }),
        defineProps: () => ({}),
        defineEmits:
          () =>
          (...args) =>
            effects.push(args),
        useWorkspace: () => ({
          select: (value) => effects.push(value),
        }),
        useSupplierCreate: () => ({
          createSupplierWorkspace: (options) => {
            submitted = options
            return flight.promise
          },
          createSupplier() {},
        }),
      }
    )
  )
  state.organizationName.value = 'Original'
  state.companyId.value = 'Company-A'
  const pending = state.handleCreate()
  assert.equal(typeof submitted.isCurrent, 'function')
  assert.equal(submitted.isCurrent(), true)
  state.companyId.value = 'Company-B'
  assert.equal(submitted.isCurrent(), false)
  flight.resolve({ id: 'original', createdRoot: true, createdTeamMember: true })
  await pending
  assert.deepEqual(effects, [])
  assert.equal(state.isCreating.value, false)
  assert.equal(state.errorMessage.value, null)
  scope.stop()
})
