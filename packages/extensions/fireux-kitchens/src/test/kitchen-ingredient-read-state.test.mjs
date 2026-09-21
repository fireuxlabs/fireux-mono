import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'
const source = readFileSync(
  new URL(
    '../runtime/kitchen/composables/workspace/ingredients/useKitchenIngredients.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
function fixture() {
  const binding = {
    data: ref(undefined),
    pending: ref(true),
    error: ref(undefined),
  }
  const roots = {
    data: ref(undefined),
    pending: ref(false),
    error: ref(undefined),
  }
  const kitchenId = ref('mine')
  const deps = {
    computed,
    unref,
    useFireUXConfig: () => ({ appId: 'app' }),
    useFirestoreRead: () => ({ firestoreFetchCollection: () => binding }),
    useLiveAsyncData: () => roots,
    useCollectionById: () => ({ byId: () => undefined }),
    resolveKitchenChildCollectionBasePath: () => 'kitchens',
    KitchenIngredientStorage: { collection: 'ingredients' },
  }
  const useKitchenIngredients = compileFunction(
    `${stripTypeScriptTypes(source)};return useKitchenIngredients`,
    Object.keys(deps)
  )(...Object.values(deps))
  return { binding, roots, kitchenId, state: useKitchenIngredients(kitchenId) }
}
test('Kitchen-link errors surface instead of indefinite loading or false empty', () => {
  const f = fixture()
  assert.equal(f.state.pending.value, true)
  f.binding.error.value = new Error('Permission denied')
  assert.equal(f.state.error.value.message, 'Permission denied')
  assert.equal(f.state.pending.value, false)
  f.binding.error.value = undefined
  f.binding.pending.value = false
  f.binding.data.value = []
  assert.equal(f.state.pending.value, false)
  assert.equal(f.state.error.value, null)
  assert.deepEqual(f.state.ingredients.value, [])
})
test('root loading, failure, ready and missing canonical Ingredient are distinct', () => {
  const f = fixture()
  f.binding.pending.value = false
  f.binding.data.value = [{ id: 'carrot', ingredient_id: 'carrot' }]
  f.roots.pending.value = true
  assert.equal(f.state.pending.value, true)
  assert.equal(f.state.ingredients.value[0].missing_root_ingredient, false)
  f.roots.error.value = new Error('Catalogue unavailable')
  assert.equal(f.state.error.value.message, 'Catalogue unavailable')
  assert.equal(f.state.pending.value, false)
  f.roots.error.value = undefined
  f.roots.pending.value = false
  f.roots.data.value = { items: [{ id: 'carrot', name: 'Carrot' }] }
  assert.equal(f.state.ingredients.value[0].name, 'Carrot')
  assert.equal(f.state.pending.value, false)
  f.roots.data.value = { items: [] }
  assert.equal(f.state.ingredients.value[0].missing_root_ingredient, true)
})
test('no Kitchen selection is not an active loading state', () => {
  const f = fixture()
  f.kitchenId.value = ''
  assert.equal(f.state.pending.value, false)
  assert.equal(f.state.collectionPath.value, '')
})
