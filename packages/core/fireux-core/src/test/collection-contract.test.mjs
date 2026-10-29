import { resolveHttpDocumentOutcome } from '../runtime/utils/http-document-outcome.ts'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, isRef, unref, toValue } from 'vue'

const root = new URL('../../../../../', import.meta.url)
function load(file, name, dependencies) {
  const source = readFileSync(new URL(file, root), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const useFirestoreCollectionState = load(
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCollection.ts',
  'useFirestoreCollectionState',
  { resolveReadOutcome, resolveHttpDocumentOutcome, computed, isRef, toValue }
)
const common = {
  computed,
  ref,
  isRef,
  unref,
  toValue,
  useFirestoreCollectionState,
  useCollectionById: (items) => ({
    byId: (id) => items.value.find((item) => item.id === id),
  }),
}

for (const [name, file, storage, args] of [
  [
    'PortfolioTask',
    'fireux-tasks/src/runtime/portfolio/composables/usePortfolioTaskCollection.ts',
    'TaskStorage',
    'portfolio',
  ],
  [
    'PortfolioComplianceRecord',
    'fireux-compliance/src/runtime/portfolio/composables/usePortfolioComplianceRecordCollection.ts',
    'ComplianceRecordStorage',
    'portfolio',
  ],
  [
    'SupplierItem',
    'fireux-suppliers/src/runtime/supplier/composables/useSupplierItemCollection.ts',
    'SupplierItemStorage',
    'supplier',
  ],
  [
    'SupplierCatalogue',
    'fireux-suppliers/src/runtime/supplier/composables/useSupplierCatalogueCollection.ts',
    'SupplierCatalogueStorage',
    'supplier',
  ],
  [
    'SupplierIngredient',
    'fireux-suppliers/src/runtime/supplier/composables/useSupplierIngredientCollection.ts',
    'SupplierIngredientStorage',
    'supplier',
  ],
]) {
  test(`${name} preserves one reactive reader and exposes idle, pending, error and empty`, () => {
    const selected = ref('')
    const pending = ref(false)
    const error = ref(undefined)
    let readCount = 0
    let sourcePath
    const useFirestoreRead = () => ({
      firestoreFetchCollection: (path) => {
        readCount++
        sourcePath = path
        return Object.assign(ref([]), { pending, error })
      },
    })
    const factory = load(
      `packages/extensions/${file}`,
      `use${name}Collection`,
      {
        ...common,
        useFirestoreRead,
        [storage]: { collection: 'records' },
        SupplierStorage: { collection: 'suppliers' },
        useActivePortfolio: () => ({}),
        usePortfolioChildPath: () =>
          computed(() =>
            selected.value ? `portfolios/${selected.value}/records` : ''
          ),
      }
    )
    const state =
      args === 'unit'
        ? factory('property-a', {})
        : args === 'supplier'
          ? factory(selected)
          : factory({ targetOutcome: ref('ready') })
    assert.equal(state.outcome.value, 'idle')
    selected.value = 'first'
    assert.match(unref(sourcePath), /first/)
    assert.equal(state.outcome.value, 'empty')
    pending.value = true
    assert.equal(state.pending.value, true)
    assert.equal(state.outcome.value, 'pending')
    pending.value = false
    error.value = new Error('read denied')
    assert.equal(state.outcome.value, 'error')
    assert.equal(state.error.value.message, 'read denied')
    error.value = undefined
    selected.value = 'second'
    assert.match(unref(sourcePath), /second/)
    assert.equal(readCount, 1)
    assert.equal(state.count.value, 0)
  })
}

test('User collection uses the public projection and exposes honest read state', () => {
  const pending = ref(true),
    error = ref(null),
    data = ref({ items: [] })
  const factory = load(
    'packages/core/fireux-core/src/runtime/user/composables/useUserCollection.ts',
    'useUserCollection',
    {
      ...common,
      resolveReadOutcome,
      useFireUXConfig: () => ({ appId: 'app' }),
      useAsyncData: () => ({ data, pending, error }),
    }
  )
  const state = factory()
  assert.equal(state.outcome.value, 'pending')
  pending.value = false
  data.value = { items: [{ id: 'public-user', display_name: 'Public' }] }
  assert.equal(state.count.value, 1)
  error.value = new Error('API unavailable')
  assert.equal(state.outcome.value, 'error')
  assert.deepEqual(state.users.value, [])
})

test('Kitchen menu paths distinguish default scope from explicitly disabled reads', () => {
  const resolveKitchenChildCollectionPath = load(
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-collection-path.ts',
    'resolveKitchenChildCollectionPath',
    {}
  )
  assert.equal(
    resolveKitchenChildCollectionPath({
      kitchenId: 'kitchen-a',
      collectionName: 'menus',
    }),
    'kitchens/kitchen-a/menus'
  )
  assert.equal(
    resolveKitchenChildCollectionPath({
      kitchenCollectionPath: '',
      kitchenId: 'kitchen-a',
      collectionName: 'menus',
    }),
    ''
  )
  assert.equal(
    resolveKitchenChildCollectionPath({
      kitchenId: '',
      collectionName: 'menus',
    }),
    ''
  )
  let path
  const factory = load(
    'packages/extensions/fireux-kitchens/src/runtime/menu/composables/useKitchenMenuCollection.ts',
    'useKitchenMenuCollection',
    {
      ...common,
      resolveKitchenChildCollectionPath,
      MenuStorage: { scopeCollection: 'menus' },
      useFireUXConfig: () => ({ appId: 'app-a' }),
      useFirestoreRead: () => ({
        firestoreFetchCollection: (value) => {
          path = value
          return Object.assign(ref([]), {
            pending: ref(false),
            error: ref(undefined),
            outcome: ref('empty'),
          })
        },
      }),
    }
  )
  factory('kitchen-a')
  assert.equal(path.value, 'kitchens/kitchen-a/menus')
  factory('kitchen-a', { kitchenCollectionPath: '' })
  assert.equal(path.value, '')
})

test('App parsing projects obsolete fields and rejects invalid identity', () => {
  const parse = load(
    'packages/core/fireux-core/src/runtime/app/utils/readApp.ts',
    'readAppDocument',
    {}
  )
  const stamp = { at: { seconds: 1, nanoseconds: 0 } }
  const valid = {
    id: 'app-a',
    ecosystem_id: 'eco-a',
    name: 'Example',
    role: 'tenant',
    status: 'active',
    created: stamp,
    updated: stamp,
  }
  assert.deepEqual(
    parse({ ...valid, project_id: 'obsolete-project' }, 'app-a'),
    valid
  )
  assert.equal(parse({ ...valid, ecosystem_id: '' }, 'bad'), null)
})

test('Public User identity normalization excludes private stored fields', () => {
  const normalizeUser = load(
    'packages/core/fireux-core/src/runtime/user/utils/normalize-user.ts',
    'normalizeUser',
    { resolveUserAvatarSource: (value) => value || '' }
  )
  const user = normalizeUser('id', {
    handle: 'DANIEL',
    display_name: '  Daniel  ',
    bio: ' Hello ',
    private_fixture: 'PRIVATE',
  })
  assert.equal(user.handle, 'daniel')
  assert.equal(user.display_name, 'Daniel')
  assert.equal(JSON.stringify(user).includes('PRIVATE'), false)
})
