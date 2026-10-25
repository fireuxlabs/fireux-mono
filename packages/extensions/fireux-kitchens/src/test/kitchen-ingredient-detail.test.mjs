import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, shallowRef } from 'vue'
function fixture() {
  const kitchenId = ref('kitchen-a'),
    id = ref('link-a'),
    uid = ref('user-a'),
    rows = ref([{ id: 'link-a', ingredient_id: 'carrot' }]),
    queryError = ref(null)
  const access = {
    ids: ref(['kitchen-a', 'kitchen-b']),
    pending: ref(false),
    error: ref(null),
  }
  const workspace = {
    id: kitchenId,
    data: ref({ id: 'kitchen-a' }),
    accountReady: ref(true),
    hasAccount: ref(true),
    outcome: ref('ready'),
  }
  const canonical = {
    ingredient: ref({ id: 'carrot', name: 'Carrot' }),
    pending: ref(false),
    outcome: ref('ready'),
    error: ref(null),
  }
  let bound, q, canonicalId
  const calls = []
  const session = {
    uid,
    appUser: ref({ created: { at: 1 } }),
    error: ref(null),
    pending: ref(false),
  }
  const source = readFileSync(
    new URL(
      '../runtime/kitchen/composables/ingredients/useKitchenIngredientDetail.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const deps = {
    computed,
    toValue: (value) => (typeof value === 'function' ? value() : value.value),
    workspace,
    id,
    useRouteParam: () => id,
    useKitchenWorkspace: () => workspace,
    useKitchenAccess: () => access,
    useAppSession: () => session,
    useFireUXConfig: () => ({ appId: 'misebox' }),
    readRuntimeFirestoreDatabaseId: () => 'misebox',
    useFirestoreResolver: () => () => ({}),
    KitchenIngredientStorage: { collection: 'ingredients' },
    collection: (_db, path) => path,
    documentId: () => '__name__',
    where: (field, op, value) => ({ field, op, value }),
    or: (...filters) => ({ filters }),
    limit: (n) => ({ limit: n }),
    query: (path, ...constraints) => ({ path, constraints }),
    useFirestoreRead: () => ({
      firestoreQuery: (query) => {
        q = query
        bound = shallowRef(q.value)
        calls.push('query')
        const pending = computed(() => q.value !== bound.value)
        return Object.assign(
          computed(() =>
            q.value && !pending.value && !queryError.value
              ? rows.value
              : undefined
          ),
          { pending, error: queryError }
        )
      },
    }),
    useIngredientDetail: (id) => {
      canonicalId = id
      calls.push('canonical')
      return canonical
    },
  }
  const state = compileFunction(
    `${stripTypeScriptTypes(source)};return useKitchenIngredientDetail(() => workspace.outcome.value === "ready" ? workspace.id.value : "", id)`,
    Object.keys(deps)
  )(...Object.values(deps))
  return {
    state,
    id,
    kitchenId,
    uid,
    rows,
    access,
    workspace,
    session,
    canonical,
    queryError,
    calls,
    settle: () => {
      bound.value = q.value
    },
    get query() {
      return q.value
    },
    get canonicalId() {
      return canonicalId.value
    },
  }
}
test('one bounded link query supports document id or canonical reference and hydrates one root', () => {
  const f = fixture()
  assert.deepEqual(f.calls, ['query', 'canonical'])
  assert.equal(f.query.path, 'kitchens/kitchen-a/ingredients')
  assert.equal(f.query.constraints[1].limit, 2)
  assert.deepEqual(
    f.query.constraints[0].filters.map((x) => x.field),
    ['__name__', 'ingredient_id']
  )
  assert.equal(f.canonicalId, 'carrot')
  assert.equal(f.state.ingredient.value.kitchen_ingredient.id, 'link-a')
  f.id.value = 'carrot'
  assert.equal(f.state.ingredient.value, null)
  f.settle()
  assert.equal(f.state.ingredient.value.name, 'Carrot')
  f.canonical.ingredient.value.name = 'Fresh carrot'
  assert.equal(f.state.ingredient.value.name, 'Fresh carrot')
})
test('missing canonical root remains a linked missing-root record; failures are not missing', () => {
  const f = fixture()
  f.canonical.ingredient.value = null
  f.canonical.outcome.value = 'empty'
  assert.equal(f.state.ingredient.value.missing_root_ingredient, true)
  f.canonical.outcome.value = 'error'
  f.canonical.error.value = new Error('Catalogue failed')
  assert.equal(f.state.ingredient.value, null)
  assert.match(f.state.loadError.value.message, /Catalogue/)
  f.canonical.error.value = null
  f.canonical.outcome.value = 'ready'
  f.rows.value = []
  assert.equal(f.state.ingredient.value, null)
  f.rows.value = [
    { id: 'a', ingredient_id: 'carrot' },
    { id: 'b', ingredient_id: 'carrot' },
  ]
  assert.match(f.state.loadError.value.message, /not unique/)
})
test('Kitchen/account changes, denied read and removed access clear identity and edit availability', () => {
  const f = fixture()
  f.uid.value = 'user-b'
  assert.equal(f.state.pending.value, true)
  assert.equal(f.state.ingredient.value, null)
  f.settle()
  f.kitchenId.value = 'kitchen-b'
  f.workspace.data.value = { id: 'kitchen-b' }
  assert.equal(f.query.path, 'kitchens/kitchen-b/ingredients')
  assert.equal(f.state.ingredient.value, null)
  f.settle()
  f.queryError.value = new Error('Denied')
  assert.equal(f.state.ingredient.value, null)
  assert.equal(f.state.canWrite.value, false)
  f.queryError.value = null
  f.access.ids.value = []
  assert.equal(f.query, null)
  assert.equal(f.state.ingredient.value, null)
})
