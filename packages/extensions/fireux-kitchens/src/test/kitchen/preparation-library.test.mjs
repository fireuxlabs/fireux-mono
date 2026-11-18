import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import {
  computed,
  effectScope,
  nextTick,
  reactive,
  ref,
  toValue,
  watch,
} from 'vue'

function load(path, result, deps = {}) {
  let source = readFileSync(
    new URL(`../../runtime/kitchen/${path}`, import.meta.url),
    'utf8'
  )
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return new Function(
    ...Object.keys(deps),
    `${stripTypeScriptTypes(source)};return ${result}`
  )(...Object.values(deps))
}
const preparationPath = 'preparation/composables/useKitchenPreparationsRead.ts'
const recipePath = 'recipe/composables/useKitchenRecipesRead.ts'
const { normalizePreparation } = load(
  preparationPath,
  '({normalizePreparation})'
)
const { normalizeRecipe } = load(recipePath, '({normalizeRecipe})')

test('Preparation is output identity; old recipe instructions are not copied onto it', () => {
  const raw = {
    id: 'sauce',
    name: ' Sauce ',
    kitchen_id: 'k',
    inputs: [{ ingredient_id: 'oil' }],
    method: ['Mix'],
    yield: { quantity: 1, unit: 'batch' },
    recipe_id: 'r',
  }
  assert.deepEqual(normalizePreparation(raw), { id: 'sauce', name: 'Sauce' })
  assert.equal(raw.recipe_id, 'r')
})

test('Recipe reads historical inputs, method and yield without pretending they are production', () => {
  const raw = {
    id: 'r',
    name: 'Burger',
    preparation: {
      ingredients: [{ ingredient_id: 'bun', quantity: 1, unit: 'each' }],
      prep_items: [{ prep_item_id: 'sauce', quantity: 30, unit: 'g' }],
      yield: { quantity: 1, unit: 'portion' },
      method: [' Assemble '],
    },
  }
  const recipe = normalizeRecipe(raw)
  assert.deepEqual(recipe.inputs, [
    { kind: 'ingredient', reference_id: 'bun', quantity: 1, unit: 'each' },
    { kind: 'preparation', reference_id: 'sauce', quantity: 30, unit: 'g' },
  ])
  assert.deepEqual(recipe.method, ['Assemble'])
  assert.equal(recipe.yield.quantity, 1)
  assert.equal(recipe.output_preparation_id, undefined)
  assert.equal(Object.hasOwn(recipe, 'stock'), false)
})

test('explicit Recipe fields win independently while untouched historical yield stays readable', () => {
  const recipe = normalizeRecipe({
    id: 'r',
    name: 'R',
    inputs: [],
    method: ['New'],
    preparation: { method: ['Old'], yield: { quantity: 100, unit: 'g' } },
    source: { url: 'javascript:alert(1)' },
  })
  assert.deepEqual(recipe.method, ['New'])
  assert.deepEqual(recipe.yield, { quantity: 100, unit: 'g' })
  assert.equal(normalizeRecipe({ id: 'unset' }).yield, undefined)
  assert.equal(
    normalizeRecipe({
      id: 'clear',
      yield: null,
      preparation: { yield: { quantity: 100, unit: 'g' } },
    }).yield,
    undefined
  )
  assert.equal(recipe.source, undefined)
})

test('both readers bind one collection to exact accessible Kitchen scope and mask stale rows/links', () => {
  for (const [path, useName, key, collection] of [
    [
      preparationPath,
      'useKitchenPreparationsRead',
      'preparations',
      'prep-items',
    ],
    [recipePath, 'useKitchenRecipesRead', 'recipes', 'recipes'],
  ]) {
    const scope = effectScope(),
      kitchen = ref('a'),
      access = { outcome: ref('ready'), ids: ref(['a']), error: ref() }
    const rows = ref([{ id: 'x', name: 'X', recipe_id: 'r' }])
    rows.outcome = ref('ready')
    rows.error = ref()
    let binds = 0,
      target
    const use = load(path, useName, {
      computed,
      toValue,
      useKitchenAccess: () => access,
      readRuntimeFirestoreDatabaseId: () => 'misebox',
      useFirestoreRead: () => ({
        firestoreFetchCollection: (input) => {
          binds++
          target = input
          return rows
        },
      }),
    })
    const reader = scope.run(() => use(kitchen))
    assert.equal(binds, 1)
    assert.equal(target.value, `kitchens/a/${collection}`)
    assert.equal(reader[key].value.length, 1)
    kitchen.value = 'b'
    assert.equal(target.value, '')
    assert.deepEqual(reader[key].value, [])
    if (reader.recipeLinks) assert.deepEqual(reader.recipeLinks.value, [])
    access.ids.value = ['b']
    assert.equal(target.value, `kitchens/b/${collection}`)
    rows.outcome.value = 'error'
    assert.equal(reader.outcome.value, 'error')
    assert.deepEqual(reader[key].value, [])
    kitchen.value = ''
    assert.equal(reader.outcome.value, 'idle')
    scope.stop()
  }
})

test('the reusable library links output recipes and consuming recipes, and scales only local quantities', async () => {
  const recipes = [
    {
      id: 'r1',
      name: 'Aioli',
      output_preparation_id: 'sauce',
      yield: { quantity: 4, unit: 'portions' },
      inputs: [
        { kind: 'ingredient', reference_id: 'oil', quantity: 200, unit: 'ml' },
      ],
      method: ['Blend'],
    },
    {
      id: 'r2',
      name: 'Burger',
      inputs: [
        { kind: 'preparation', reference_id: 'sauce', quantity: 30, unit: 'g' },
      ],
      method: ['Assemble'],
    },
  ]
  const props = reactive({
    view: 'recipes',
    selectedId: 'r1',
    recipes,
    preparations: [{ id: 'sauce', name: 'Aioli' }],
    recipeLinks: [{ preparationId: 'sauce', recipeId: 'r1' }],
    inputLabels: {},
  })
  const before = structuredClone(recipes),
    scope = effectScope()
  const state = scope.run(() =>
    load(
      'components/Workspace/Prep/Library.vue',
      '({recipesFor,usedBy,outputIds,targetYield,scaledQuantity})',
      {
        computed,
        ref,
        watch,
        defineProps: () => props,
        withDefaults: (value) => value,
      }
    )
  )
  assert.deepEqual(state.outputIds(props.recipes[0]), ['sauce'])
  assert.equal(state.recipesFor('sauce').length, 1)
  assert.equal(state.usedBy('sauce')[0].id, 'r2')
  state.targetYield.value = 8
  assert.equal(state.scaledQuantity(200), '400')
  assert.deepEqual(recipes, before)
  props.selectedId = 'r2'
  await nextTick()
  assert.equal(state.targetYield.value, '')
  assert.equal(state.scaledQuantity(30), '30')
  scope.stop()
})

test('Prep library coordinates one reader graph, gates Ingredient inputs by view and follows selected Kitchen', async () => {
  const scope = effectScope(),
    view = ref('preparations')
  const workspace = { id: ref('a'), outcome: ref('ready') }
  const preparations = ref([{ id: 'sauce', name: 'Sauce' }])
  const recipes = ref([{ id: 'r', name: 'Sauce recipe' }])
  const ready = ref('ready'),
    calls = { catalogue: 0, associations: 0, preparations: 0, recipes: 0 }
  let catalogueEnabled, associationScope, preparationScope, recipeScope
  const state = scope.run(() =>
    load(
      'composables/workspace/prep/library.ts',
      'useKitchenWorkspacePrepLibrary(view)',
      {
        computed,
        toValue,
        view,
        useKitchenWorkspace: () => workspace,
        useIngredientCollection: (options) => {
          calls.catalogue++
          catalogueEnabled = options.enabled
          return {
            ingredients: ref([{ id: 'oil', name: 'Oil' }]),
            outcome: ready,
            error: ref(),
          }
        },
        useKitchenChildCollection: (collection, id) => {
          assert.equal(collection, 'ingredients')
          calls.associations++
          associationScope = id
          return {
            items: ref([{ ingredient_id: 'oil' }]),
            outcome: ready,
            error: ref(),
          }
        },
        useKitchenPreparationsRead: (id) => {
          calls.preparations++
          preparationScope = id
          return {
            preparations,
            recipeLinks: ref([{ preparationId: 'sauce', recipeId: 'r' }]),
            outcome: ready,
            error: ref(),
          }
        },
        useKitchenRecipesRead: (id) => {
          calls.recipes++
          recipeScope = id
          return {
            recipes,
            explicitOutputRecipeIds: ref(['r']),
            outcome: ready,
            error: ref(),
          }
        },
      }
    )
  )
  assert.equal(catalogueEnabled(), false)
  assert.equal(associationScope.value, '')
  assert.equal(preparationScope, recipeScope)
  assert.equal(preparationScope.value, 'a')
  assert.deepEqual(state.recipeLinks.value, [])
  view.value = 'recipes'
  await nextTick()
  assert.equal(catalogueEnabled(), true)
  assert.equal(associationScope.value, 'a')
  assert.deepEqual(state.ingredientOptions.value, [
    { value: 'oil', label: 'Oil' },
  ])
  workspace.id.value = 'b'
  assert.equal(preparationScope.value, 'b')
  assert.equal(associationScope.value, 'b')
  workspace.outcome.value = 'pending'
  assert.equal(preparationScope.value, '')
  assert.equal(state.outcome.value, 'pending')
  assert.deepEqual(calls, {
    catalogue: 1,
    associations: 1,
    preparations: 1,
    recipes: 1,
  })
  scope.stop()
})
