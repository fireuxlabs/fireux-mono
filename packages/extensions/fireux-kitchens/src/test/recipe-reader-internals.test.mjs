import { commandScopeDeps } from './command-scope-fixture.mjs'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  compile,
  computed,
  createSSRApp,
  effectScope,
  h,
  ref,
  shallowRef,
  toValue,
  unref,
  watch,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
const runtime = new URL('../runtime/', import.meta.url)
function load(path, result, deps) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.server', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const { normalizeRecipePreparation } = load(
  'kitchen/utils/recipe-preparation.ts',
  '({ normalizeRecipePreparation })',
  {}
)
const { RecipeStorage, normalizeRecipe } = load(
  'kitchen/utils/recipe.ts',
  '({ RecipeStorage, normalizeRecipe })',
  { normalizeRecipePreparation }
)
const { normalizeKitchenPrepItem } = load(
  'kitchen/utils/prep-item.ts',
  '({ normalizeKitchenPrepItem })',
  {}
)
const { resolveKitchenChildCollectionBasePath } = load(
  'kitchen/utils/kitchen-collection-path.ts',
  '({ resolveKitchenChildCollectionBasePath })',
  {}
)
const { useFirestoreCollectionState } = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCollection.ts',
  '({ useFirestoreCollectionState })',
  { computed, resolveReadOutcome, toValue }
)
const { useKitchenWorkspaceReadPage } = load(
  'kitchen/composables/workspace/useKitchenWorkspaceReadPage.ts',
  '({ useKitchenWorkspaceReadPage })',
  { computed, unref }
)
const enhanceFirestoreRead = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts',
  'enhanceFirestoreRead',
  { computed, ref, shallowRef, unref, watch, resolveReadOutcome }
)
function bindingFixture() {
  const scope = effectScope(),
    raw = ref([{ id: 'dough', name: 'Dough' }])
  Object.assign(raw, {
    data: raw,
    pending: ref(false),
    error: ref(undefined),
    promise: shallowRef(Promise.resolve()),
    stop: () => {},
  })
  let target
  const read = {
    firestoreFetchCollection: (p) => {
      target = p
      return enhanceFirestoreRead(raw, {
        active: computed(() => Boolean(toValue(p))),
        source: p,
        kind: 'collection',
      })
    },
  }
  const useCollection = (p) => {
    target = p
    return raw
  }
  return {
    scope,
    raw,
    read,
    useCollection,
    get path() {
      return toValue(target)
    },
    settle(rows) {
      raw.value = rows
      raw.pending.value = false
      raw.promise.value = Promise.resolve()
    },
  }
}
function workspaceFixture() {
  const f = bindingFixture(),
    workspace = {
      id: ref('mine'),
      data: ref({ id: 'mine', name: 'Mine' }),
      outcome: ref('ready'),
      accountReady: ref(true),
      hasAccount: ref(true),
    }
  const access = { ids: ref(['mine']), error: ref(null) },
    session = { error: ref(null) }
  const useKitchenRecipeCollection = load(
    'kitchen/composables/useKitchenRecipeCollection.ts',
    'useKitchenRecipeCollection',
    {
      computed,
      unref,
      useFireUXConfig: () => ({ appId: 'app' }),
      useFirestoreRead: () => f.read,
      RecipeStorage,
      normalizeRecipe,
      resolveKitchenChildCollectionBasePath,
      useFirestoreCollectionState,
    }
  )
  const use = load(
    'kitchen/composables/workspace/recipes/useKitchenWorkspaceRecipes.ts',
    'useKitchenWorkspaceRecipes',
    {
      computed,
      useKitchenWorkspace: () => workspace,
      useKitchenAccess: () => access,
      useAppSession: () => session,
      useKitchenRecipeCollection,
      RecipeStorage,
      readRuntimeFirestoreDatabaseId: () => 'misebox',
      useKitchenWorkspaceReadPage,
    }
  )
  const state = f.scope.run(use)
  return {
    ...f,
    workspace,
    access,
    session,
    state,
    get path() {
      return f.path
    },
  }
}
test('Recipe collection targets only exact ready Kitchen and hides prior rows for unready or changed owners', () => {
  const f = workspaceFixture()
  assert.equal(f.path, 'kitchens/mine/recipes')
  assert.equal(f.state.recipes.value[0].name, 'Dough')
  for (const outcome of ['pending', 'error', 'missing', 'empty', 'idle']) {
    f.workspace.outcome.value = outcome
    assert.equal(f.path, '')
    assert.deepEqual(f.state.recipes.value, [])
    assert.equal(f.state.canWrite.value, false)
    assert.equal(f.state.outcome.value, outcome)
  }
  f.workspace.outcome.value = 'ready'
  f.workspace.data.value = { id: 'wrong' }
  assert.equal(f.path, '')
  assert.equal(f.state.outcome.value, 'pending')
  f.workspace.data.value = { id: 'mine' }
  f.settle([{ id: 'dough', name: 'Fresh dough' }])
  assert.equal(f.state.recipes.value[0].name, 'Fresh dough')
  f.scope.stop()
})
test('Recipe loading, failure, empty and inactive are distinct', () => {
  const f = workspaceFixture()
  f.raw.pending.value = true
  assert.equal(f.state.outcome.value, 'pending')
  assert.deepEqual(f.state.recipes.value, [])
  f.raw.error.value = new Error('Recipes denied')
  assert.equal(f.state.outcome.value, 'error')
  assert.equal(f.state.pending.value, false)
  assert.equal(f.state.error.value.message, 'Recipes denied')
  f.settle([])
  assert.equal(f.state.outcome.value, 'empty')
  assert.equal(f.state.canWrite.value, true)
  f.workspace.outcome.value = 'error'
  f.access.error.value = new Error('Kitchen access failed')
  assert.equal(f.state.error.value.message, 'Kitchen access failed')
  f.workspace.id.value = ''
  f.workspace.outcome.value = 'idle'
  assert.equal(f.state.outcome.value, 'idle')
  assert.equal(f.state.error.value, undefined)
  f.scope.stop()
})
test('Recipe reader respects explicitly disabled parent path', () => {
  const f = bindingFixture()
  const use = load(
    'kitchen/composables/useKitchenRecipeCollection.ts',
    'useKitchenRecipeCollection',
    {
      computed,
      unref,
      useFireUXConfig: () => ({ appId: 'app' }),
      useFirestoreRead: () => f.read,
      RecipeStorage,
      normalizeRecipe,
      resolveKitchenChildCollectionBasePath,
      useFirestoreCollectionState,
    }
  )
  const state = f.scope.run(() =>
    use(ref('mine'), { kitchenCollectionPath: ref('') })
  )
  assert.equal(f.path, '')
  assert.equal(state.outcome.value, 'idle')
  assert.deepEqual(state.recipes.value, [])
  f.scope.stop()
})
test('Recipe record distinguishes unavailable owner, unavailable source and missing route', () => {
  const f = workspaceFixture(),
    id = ref('dough')
  const use = load(
    'kitchen/composables/workspace/recipes/useKitchenWorkspaceRecipe.ts',
    'useKitchenWorkspaceRecipe',
    {
      computed,
      useRouteParam: () => id,
      useKitchenWorkspaceRecipes: () => f.state,
    }
  )
  const record = use()
  assert.equal(record.outcome.value, 'ready')
  id.value = 'missing'
  assert.equal(record.outcome.value, 'missing')
  f.raw.pending.value = true
  assert.equal(record.outcome.value, 'pending')
  assert.equal(record.recipe.value, null)
  f.raw.error.value = new Error('No read')
  assert.equal(record.outcome.value, 'error')
  f.workspace.id.value = ''
  f.workspace.outcome.value = 'idle'
  assert.equal(record.outcome.value, 'idle')
  f.scope.stop()
})
function prepFixture() {
  const f = bindingFixture(),
    kitchenId = ref('mine'),
    parent = ref('kitchens')
  f.raw.value = [
    { id: 'sauce', name: 'Sauce', kitchen_id: 'mine', method: ['Mix'] },
  ]
  const use = load(
    'kitchen/composables/prep-item/useKitchenPrepItems.ts',
    'useKitchenPrepItems',
    {
      computed,
      unref,
      useFirestoreRead: () => f.read,
      useFirestoreCollectionState,
      normalizeKitchenPrepItem,
      useFirestore: () => ({}),
      useCollection: f.useCollection,
      collection: (_db, p) => p,
    }
  )
  const state = f.scope.run(() =>
    use(kitchenId, {
      kitchenCollectionPath: parent,
      databaseId: ref('misebox'),
    })
  )
  return {
    ...f,
    kitchenId,
    parent,
    state,
    get path() {
      return f.path
    },
  }
}
test('Prep reader Core lifecycle masks retained definitions on refresh, failure, scope switch and inactive parent', () => {
  const f = prepFixture()
  assert.equal(f.state.prepItems.value[0].method[0], 'Mix')
  f.raw.pending.value = true
  assert.deepEqual(f.state.prepItems.value, [])
  f.raw.error.value = new Error('Prep denied')
  assert.deepEqual(f.state.prepItems.value, [])
  assert.equal(f.state.outcome.value, 'error')
  f.settle([{ id: 'sauce', name: 'Current Sauce' }])
  f.kitchenId.value = 'other'
  assert.equal(f.state.outcome.value, 'pending')
  assert.deepEqual(f.state.prepItems.value, [])
  f.settle([{ id: 'sauce', name: 'Other Sauce' }])
  assert.equal(f.state.prepItems.value[0].name, 'Other Sauce')
  f.parent.value = ''
  assert.equal(f.path, '')
  assert.equal(f.state.outcome.value, 'idle')
  assert.deepEqual(f.state.prepItems.value, [])
  f.scope.stop()
})
async function render(path, state) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const warnings = [],
    app = createSSRApp({
      setup: () => state,
      render: compile(template, {
        onError: (e) => {
          throw e
        },
        onWarn: (e) => {
          throw e
        },
      }),
    })
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of [
    'DiagnosticsDebugPanel',
    'UButton',
    'UIcon',
    'WorkspaceKitchenRecipesCollection',
    'WorkspaceKitchenRecipesPreparation',
  ])
    app.component(name, {
      render: () =>
        name === 'WorkspaceKitchenRecipesPreparation'
          ? h('p', 'Recipe method remains')
          : null,
    })
  for (const name of ['UAlert', 'MoleculesStateCard'])
    app.component(name, {
      props: ['title'],
      setup: (props) => () => h('p', props.title),
    })
  app.component('WorkspaceKitchenRecipesForm', {
    props: ['recipe', 'canWrite'],
    setup: (props) => () =>
      h(
        'p',
        { 'data-can-write': String(props.canWrite) },
        `Editor: ${props.recipe?.id || 'new'}`
      ),
  })
  app.component('USkeleton', { render: () => h('p', 'Loading recipes') })
  app.component('WorkspaceKitchenCollectionToolbar', {
    props: ['count'],
    setup: (props) => () => h('p', `Count: ${props.count}`),
  })
  for (const name of [
    'WorkspaceKitchenCollectionHeader',
    'UCard',
    'UBadge',
    'WorkspaceKitchenCollectionRow',
  ])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          h('div', [slots.default?.(), slots.actions?.()]),
    })
  app.component('USlideover', {
    props: ['open'],
    setup:
      (props, { slots }) =>
      () =>
        props.open ? h('div', [slots.body?.(), slots.footer?.()]) : null,
  })
  const html = await renderToString(app)
  assert.deepEqual(warnings, [])
  return html
}
function readView(overrides = {}) {
  return {
    outcome: 'ready',
    error: null,
    pending: false,
    focus: { name: 'Mine' },
    canWrite: false,
    canCreateRecipe: false,
    visibleRecipes: [],
    recipes: [],
    query: '',
    filters: [{ value: 'all', label: 'All', count: 0 }],
    filter: 'all',
    createOpen: false,
    previewOpen: false,
    selectedRecipe: null,
    ingredientNames: {},
    prepItemNames: {},
    prepItems: [],
    ingredientsPending: false,
    ingredientsError: null,
    prepPending: false,
    prepError: null,
    kitchenId: 'mine',
    databaseId: 'misebox',
    rootCollection: 'kitchens',
    debug: {},
    ...overrides,
  }
}
test('actual Recipe index distinguishes owner states before collection', async () => {
  for (const [outcome, expected] of [
    ['pending', 'Loading Kitchen'],
    ['error', 'Kitchen unavailable'],
    ['missing', 'Kitchen not found'],
    ['idle', 'Select a kitchen'],
  ])
    assert.match(
      await render('kitchen/components/Workspace/Recipes/Index.vue', {
        storageKitchenId: '',
        outcome,
      }),
      new RegExp(expected)
    )
})
test('actual Recipe collection hides premature counts and filters while loading or failing', async () => {
  for (const outcome of ['pending', 'error']) {
    const html = await render(
      'kitchen/components/Workspace/Recipes/Collection/Index.vue',
      readView({
        outcome,
        pending: outcome === 'pending',
        error: outcome === 'error' ? new Error('No read') : null,
      })
    )
    assert.doesNotMatch(html, /Count:|Recipe status filter|No recipes yet/)
  }
  const html = await render(
    'kitchen/components/Workspace/Recipes/Collection/Index.vue',
    readView({ outcome: 'empty' })
  )
  assert.match(html, /Count: 0/)
  assert.match(html, /No recipes yet/)
})
test('actual Recipe detail retains method while linked Ingredients or Prep details fail', async () => {
  const state = {
    outcome: 'ready',
    recipe: { id: 'dough', name: 'Dough' },
    error: null,
    pending: false,
    canWrite: false,
    editing: false,
    editorRecipe: null,
    deleting: false,
    kitchenId: 'mine',
    recipeId: 'dough',
    rootCollection: 'kitchens',
    databaseId: 'misebox',
    debug: {},
    ingredientNames: {},
    prepItemNames: {},
    prepItems: [],
    ingredientsPending: true,
    ingredientsError: new Error('Catalogue'),
    prepPending: true,
    prepError: new Error('Prep'),
  }
  const html = await render(
    'kitchen/components/Workspace/Recipes/Detail/Index.vue',
    state
  )
  assert.match(html, /Ingredient details unavailable/)
  assert.match(html, /Prep items unavailable/)
  assert.match(html, /Recipe method remains/)
  assert.doesNotMatch(html, /Loading prep|Loading ingredient|Recipe not found/)
  const inactive = await render(
    'kitchen/components/Workspace/Recipes/Detail/Index.vue',
    { ...state, outcome: 'idle', recipe: null, error: new Error('Old') }
  )
  assert.match(inactive, /Select a kitchen/)
  assert.doesNotMatch(inactive, /Recipe unavailable|Recipe not found/)
})
test('actual Recipe preview exposes independent linked failures', async () => {
  const html = await render(
    'kitchen/components/Workspace/Recipes/Collection/Index.vue',
    readView({
      previewOpen: true,
      selectedRecipe: { id: 'dough', name: 'Dough' },
      ingredientsError: new Error('Catalogue'),
      prepError: new Error('Prep'),
    })
  )
  assert.match(html, /Ingredient details unavailable/)
  assert.match(html, /Prep items unavailable/)
  assert.match(html, /Recipe method remains/)
})
test('Dish Prep consumer receives additive lifecycle states without losing saved requirements', () => {
  const f = prepFixture(),
    dish = ref({
      spec: { prep_items: [{ prep_item_id: 'sauce', quantity: 2, unit: 'g' }] },
    })
  const state = f.scope.run(() =>
    load(
      'kitchen/components/Workspace/Dishes/Preparation.vue',
      '({rows, groups, pending, error})',
      {
        computed,
        useKitchenWorkspaceDish: () => ({
          dish,
          kitchenId: f.kitchenId,
          storageKitchenId: f.kitchenId,
          databaseId: ref('misebox'),
          rootCollection: f.parent,
        }),
        useKitchenPrepItems: () => f.state,
      }
    )
  )
  assert.equal(state.rows.value[0].item.name, 'Sauce')
  f.raw.error.value = new Error('Prep denied')
  assert.equal(state.rows.value[0].item, undefined)
  assert.equal(state.error.value.message, 'Prep denied')
  assert.equal(state.rows.value[0].quantity, 2)
  f.scope.stop()
})
test('Dish Spec options consume masked Prep data while preserving their existing readError contract', () => {
  const f = prepFixture()
  const specification = load(
    'kitchen/utils/dish-specification.ts',
    '({emptyDishSpecification,validateDishSpecification})',
    { isFirestoreDocumentId }
  )
  const useDishEditorScope = load(
    'kitchen/composables/dish/useDishEditorScope.ts',
    'useDishEditorScope',
    commandScopeDeps({
      watch,
      useAuth: () => ({ currentUser: ref({ uid: 'actor' }) }),
    })
  )
  const state = f.scope.run(() =>
    load(
      'kitchen/components/Workspace/Dishes/Spec.vue',
      '({prepOptions, readError})',
      {
        computed,
        ref,
        watch,
        ...specification,
        useRoute: () => ({ query: {} }),
        useDishEditorScope,
        useKitchenWorkspaceDish: () => ({
          dish: ref({}),
          dishId: ref('dish'),
          kitchenId: f.kitchenId,
          storageKitchenId: ref(f.kitchenId.value),
          rootCollection: f.parent,
          databaseId: ref('misebox'),
          canWrite: ref(true),
        }),
        useKitchenIngredients: () => ({
          ingredients: ref([]),
          error: ref(null),
        }),
        useKitchenPrepItems: () => f.state,
        useKitchenRecipeCollection: () => ({
          recipes: ref([]),
          error: ref(null),
        }),
        useDishUpdate: () => ({}),
        useKitchenPrepItemCreate: () => ({}),
      }
    )
  )
  assert.deepEqual(state.prepOptions.value, [
    { label: 'Sauce', value: 'sauce' },
  ])
  f.raw.error.value = new Error('Prep unavailable')
  assert.deepEqual(state.prepOptions.value, [])
  assert.equal(state.readError.value.message, 'Prep unavailable')
  f.scope.stop()
})
test('Detail local editor seed survives only same-intent read refresh/failure and closes on settled missing or scope change', () => {
  const scope = effectScope(),
    record = {
      recipe: ref({ id: 'dough', name: 'Dough' }),
      recipeId: ref('dough'),
      kitchenId: ref('mine'),
      storageKitchenId: ref('mine'),
      rootCollection: ref('kitchens'),
      databaseId: ref('misebox'),
      dishUsage: ref([]),
      pending: ref(false),
      canWrite: ref(true),
      debug: ref({}),
      error: ref(null),
      outcome: ref('ready'),
    }
  let invalidate
  const state = scope.run(() =>
    load(
      'kitchen/components/Workspace/Recipes/Detail/Index.vue',
      '({editing, editorRecipe, editRecipe})',
      {
        computed,
        ref,
        watch,
        navigateTo: () => {},
        useToastify: () => ({}),
        useRecipeScope: (_sources, reset) => {
          invalidate = reset
          return () => () => true
        },
        useKitchenWorkspaceRecipe: () => record,
        useRecipeDelete: () => ({}),
        useKitchenIngredients: () => ({
          ingredients: ref([]),
          pending: ref(false),
          error: ref(null),
        }),
        useKitchenPrepItems: () => ({
          prepItems: ref([]),
          pending: ref(false),
          error: ref(null),
        }),
      }
    )
  )
  state.editRecipe()
  const seed = state.editorRecipe.value
  record.recipe.value = null
  record.outcome.value = 'pending'
  assert.equal(state.editing.value, true)
  assert.equal(state.editorRecipe.value, seed)
  record.outcome.value = 'error'
  assert.equal(state.editorRecipe.value, seed)
  record.recipe.value = { id: 'dough', name: 'Updated Dough' }
  record.outcome.value = 'ready'
  assert.equal(state.editorRecipe.value.name, 'Updated Dough')
  record.outcome.value = 'missing'
  assert.equal(state.editing.value, false)
  assert.equal(state.editorRecipe.value, null)
  record.outcome.value = 'ready'
  state.editRecipe()
  invalidate()
  assert.equal(state.editing.value, false)
  assert.equal(state.editorRecipe.value, null)
  scope.stop()
})

test('actual Detail template keeps a locked local editor mounted through its own live refresh', async () => {
  const html = await render('kitchen/components/Workspace/Recipes/Detail/Index.vue', {
    outcome: 'pending',
    closeEditor: () => {},
    recipe: null,
    editorRecipe: { id: 'dough', name: 'Dough' },
    error: null,
    pending: true,
    canWrite: true,
    editing: true,
    deleting: false,
    kitchenId: 'mine',
    recipeId: 'dough',
    rootCollection: 'kitchens',
    databaseId: 'misebox',
    debug: {},
    ingredientNames: {},
    prepItemNames: {},
    prepItems: [],
    ingredientsPending: false,
    ingredientsError: null,
    prepPending: false,
    prepError: null,
  })
  assert.match(html, /Editor: dough/)
  assert.match(html, /data-can-write="false"/)
  assert.doesNotMatch(html, /Recipe not found/)
})
