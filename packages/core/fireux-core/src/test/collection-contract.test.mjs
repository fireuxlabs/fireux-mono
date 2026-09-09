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
  { computed, isRef, toValue }
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
        usePortfolioWorkspaceChildPath: () =>
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
          : factory({})
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

test('User reader explicitly selects identity database and exposes read state', () => {
  const pending = ref(true),
    error = ref(undefined)
  let options, path
  const factory = load(
    'packages/core/fireux-core/src/runtime/user/composables/useUserCollection.ts',
    'useUserCollection',
    {
      ...common,
      readRuntimeIdentityFirestoreDatabaseId: () => 'identity-db',
      useFirestoreRead: (input) => {
        options = input
        return {
          firestoreFetchCollection: (input) => {
            path = input
            return Object.assign(ref([]), {
              pending,
              error,
              outcome: ref('pending'),
            })
          },
        }
      },
    }
  )
  const state = factory()
  assert.equal(options.databaseId, 'identity-db')
  assert.equal(path, 'users')
  assert.equal(state.pending.value, true)
  assert.deepEqual(state.users.value, [])
  assert.equal(state.outcome.value, 'pending')
})


test('Kitchen menu paths distinguish default scope from explicitly disabled reads', () => {
  const resolveKitchenChildCollectionPath = load('packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-collection-path.ts', 'resolveKitchenChildCollectionPath', {})
  assert.equal(resolveKitchenChildCollectionPath({ kitchenId: 'kitchen-a', collectionName: 'menus' }), 'kitchens/kitchen-a/menus')
  assert.equal(resolveKitchenChildCollectionPath({ kitchenCollectionPath: '', kitchenId: 'kitchen-a', collectionName: 'menus' }), '')
  assert.equal(resolveKitchenChildCollectionPath({ kitchenId: '', collectionName: 'menus' }), '')
  let path
  const factory = load('packages/extensions/fireux-kitchens/src/runtime/menu/composables/useKitchenMenuCollection.ts', 'useKitchenMenuCollection', {
    ...common, resolveKitchenChildCollectionPath, MenuStorage: { scopeCollection: 'menus' },
    useFireUXConfig: () => ({ appId: 'app-a' }),
    useFirestoreRead: () => ({ firestoreFetchCollection: value => {
      path = value
      return Object.assign(ref([]), { pending: ref(false), error: ref(undefined), outcome: ref('empty') })
    } }),
  })
  factory('kitchen-a')
  assert.equal(path.value, 'kitchens/kitchen-a/menus')
  factory('kitchen-a', { kitchenCollectionPath: '' })
  assert.equal(path.value, '')
})

test('App collection applies the same strict document parser as App detail', () => {
  const readAppDocument = load('packages/core/fireux-core/src/runtime/app/utils/readApp.ts', 'readAppDocument', {})
  const stamp = { at: { seconds: 1, nanoseconds: 0 } }
  const valid = { id: 'app-a', ecosystem_id: 'eco-a', name: 'Example', role: 'tenant', status: 'active', created: stamp, updated: stamp }
  const source = Object.assign(ref([{ ...valid, project_id: 'obsolete-project' }, { ...valid, id: 'bad', ecosystem_id: '' }]), { pending: ref(false), error: ref(undefined) })
  const factory = load('packages/core/fireux-core/src/runtime/app/composables/useAppCollection.ts', 'useAppCollection', {
    ...common, readAppDocument,
    useFirestoreRead: () => ({ firestoreFetchCollection: () => source }),
  })
  const result = factory()
  assert.deepEqual(result.apps.value, [valid])
  assert.equal(result.count.value, 1)
  source.value = []
  assert.equal(result.outcome.value, 'empty')
})

test('User collection normalizes presentation just like User detail', () => {
  const normalizeUser = load('packages/core/fireux-core/src/runtime/user/utils/normalize-user.ts', 'normalizeUser', { resolveUserAvatarSource: value => value ?? '' })
  const source = Object.assign(ref([{ id: 'user-a', display_name: '  Daniel  ', handle: 'DANIEL', bio: ' Hello ' }]), { pending: ref(false), error: ref(undefined), outcome: ref('ready') })
  const factory = load('packages/core/fireux-core/src/runtime/user/composables/useUserCollection.ts', 'useUserCollection', {
    ...common, normalizeUser, readRuntimeIdentityFirestoreDatabaseId: () => 'identity',
    useFirestoreRead: () => ({ firestoreFetchCollection: () => source }),
  })
  const result = factory()
  assert.equal(result.users.value[0].display_name, 'Daniel')
  assert.equal(result.users.value[0].handle, 'daniel')
  assert.equal(result.users.value[0].bio, 'Hello')
})
