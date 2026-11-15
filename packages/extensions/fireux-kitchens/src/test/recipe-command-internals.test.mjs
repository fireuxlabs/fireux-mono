import { readRecipeChanges } from '../runtime/kitchen/recipe/changes.ts'
import { readAppUserSubscription } from '../../../../core/fireux-core/src/runtime/app/app-user/utils/validation.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'

function load(path, names, dependencies = {}) {
  const source = stripTypeScriptTypes(
    readFileSync(new URL(path, import.meta.url), 'utf8')
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type[\s\S]*?from[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${source};return {${names.join(',')}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const requireFirestoreDocumentId = (id) => {
  if (!isFirestoreDocumentId(id))
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return id.trim()
}
const input = load(
  '../runtime/kitchen/server/recipes/record-input.ts',
  ['recipeTarget', 'recipeFields', 'validateRecipeInput'],
  { createError, defineFirestoreMutationTarget: (x) => x.collectionPath }
)
const membership = load(
  '../../../../core/fireux-core/src/runtime/app/app-user/utils/membership-access.ts',
  ['readMembershipAccessIds']
)
const access = load(
  '../runtime/kitchen/utils/kitchen-access.ts',
  ['readKitchenAccessIds'],
  { ...membership, KITCHEN_USER_LIMIT: 500 }
)
const authority = load(
  '../runtime/kitchen/server/core/mutation-authority.ts',
  ['requireKitchenRecordMutationAuthority'],
  {
    ...access,
    createError,
    serverAppUsersTarget: (app) => `apps/${app}/users`,
    serverKitchenAccessTarget: () => 'kitchen_access',
    KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
    PLACE_MUTATION_TARGETS: { places: 'places' },
    readAppUserSubscription,
  }
)
const taxonomy = load('../runtime/ingredient/models/ingredient-taxonomy.ts', [
  'INGREDIENT_CATEGORIES',
])
const migration = load(
  '../runtime/ingredient/server/category-migration.ts',
  ['readIngredientCategory'],
  taxonomy
)
const catalogue = load(
  '../runtime/ingredient/server/normalize.ts',
  ['isActiveIngredient', 'normalizeIngredient', 'normalizeIngredientAliases'],
  {
    ...migration,
    isFirestoreDocumentId,
    IngredientDefaults: { created: {}, updated: {} },
  }
)
const references = load(
  '../runtime/kitchen/server/core/preparation-references.ts',
  [
    'requireKitchenIngredientReferences',
    'requireKitchenRecipeReference',
    'requireUnusedKitchenRecipe',
  ],
  {
    ...catalogue,
    createError,
    defineFirestoreMutationTarget: (x) => x.collectionPath,
    INGREDIENT_MUTATION_TARGETS: { ingredients: 'ingredients' },
    serverKitchenItemsTarget: (kitchen) => `kitchens/${kitchen}/dishes`,
  }
)
const prepTranslation = load('../runtime/kitchen/utils/prep-item.ts', [
  'normalizeKitchenPrepItemTranslatedText',
])
function deferred() {
  let resolve
  const promise = new Promise((done) => (resolve = done))
  return { promise, resolve }
}
function fixture({ wait, retry } = {}) {
  const at = { seconds: 1, nanoseconds: 0 },
    writes = [],
    reads = [],
    pages = []
  const records = new Map([
    ['kitchens/k', {}],
    [
      'apps/app/users/u',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    [
      'kitchen_access/u',
      { apps: { app: { ids: ['k'], membership_created_at: at } } },
    ],
    [
      'kitchens/k/recipes/existing',
      {
        kitchen_id: 'k',
        names: { en: 'Old', de: 'German' },
        descriptions: { en: 'Old description', de: 'German notes' },
      },
    ],
    ['kitchens/k/ingredients/onion', { ingredient_id: 'onion' }],
    ['ingredients/onion', { name: 'Onion', category: 'vegetables' }],
    ['kitchens/k/prep-items/sauce', { kitchen_id: 'k', name: 'Sauce' }],
  ])
  const dependencies = {
    readRecipeChanges,
    ...input,
    ...authority,
    ...references,
    ...prepTranslation,
    createError,
    requireFirestoreDocumentId,
    normalizeSlug: (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    defineFirestoreMutationTarget: (x) => x.collectionPath,
    serverAuditStamp: (x) => x,
    readKitchenMutationActor: async () => {
      await wait?.promise
      return { uid: 'u', runtimeAppId: 'app' }
    },
    runGuardedServerTransaction: async (_, work) => {
      async function run(commit) {
        let writing = false
        const staged = []
        const result = await work({
          read: async (target, id) => {
            assert.equal(writing, false, 'transaction read follows write')
            reads.push(`${target}/${id}`)
            return {
              exists: records.has(`${target}/${id}`),
              data: records.get(`${target}/${id}`),
            }
          },
          readAll: async (target, limit, afterId) => {
            assert.equal(writing, false, 'query follows write')
            pages.push({ target, limit, afterId })
            return [...records]
              .filter(([path]) => path.startsWith(target + '/'))
              .map(([path, data]) => ({
                id: path.slice(target.length + 1),
                data,
              }))
              .filter(
                ({ id }) => !id.includes('/') && (!afterId || id > afterId)
              )
              .sort((a, b) => a.id.localeCompare(b.id))
              .slice(0, limit)
          },
          create: (...args) => {
            writing = true
            staged.push(['create', ...args])
          },
          update: (...args) => {
            writing = true
            staged.push(['update', ...args])
          },
          delete: (...args) => {
            writing = true
            staged.push(['delete', ...args])
          },
        })
        if (commit) writes.push(...staged.map((row) => structuredClone(row)))
        return result
      }
      if (retry) {
        await run(false)
        retry(records)
      }
      return run(true)
    },
  }
  Object.assign(
    dependencies,
    load(
      '../runtime/kitchen/server/prep-items/create-input.ts',
      ['readPrepItemCreateInput'],
      dependencies
    )
  )
  dependencies.requireRecipeDefinitionReferences = load(
    '../runtime/kitchen/recipe/server/references.ts',
    ['requireRecipeDefinitionReferences'],
    dependencies
  ).requireRecipeDefinitionReferences
  const commands = Object.assign(
    {},
    ...['create', 'update', 'delete'].map((action) =>
      load(
        `../runtime/kitchen/server/recipes/${action}.ts`,
        [action + 'Recipe'],
        dependencies
      )
    ),
    load(
      '../runtime/kitchen/server/prep-items/create.ts',
      ['createKitchenPrepItem'],
      dependencies
    )
  )
  return { ...commands, records, writes, reads, pages }
}
const ready = () => ({
  yield: { quantity: 2, unit: 'portion' },
  inputs: [
    {
      kind: 'ingredient',
      reference_id: 'onion',
      quantity: 1,
      unit: 'g',
      note: '',
    },
    {
      kind: 'preparation',
      reference_id: 'sauce',
      quantity: 1,
      unit: 'portion',
      note: '',
    },
  ],
  method: ['Mix.'],
})

test('Recipe and Prep actions require membership and exact associations but do not require a Place', async () => {
  const h = fixture()
  await h.createRecipe(
    {},
    {
      kitchenId: 'k',
      draft: { name: 'Dough', ...ready() },
    }
  )
  await h.updateRecipe(
    {},
    { kitchenId: 'k', recipeId: 'existing', changes: ready() }
  )
  await h.deleteRecipe({}, { kitchenId: 'k', recipeId: 'existing' })
  await h.createKitchenPrepItem(
    {},
    {
      kitchenId: 'k',
      draft: {
        name: 'Stock',
        source_language: 'en',
        recipe_id: 'existing',
        inputs: [{ ingredient_id: 'onion', quantity: 1, unit: 'g' }],
      },
    }
  )
  assert.equal(h.writes.length, 4)
  assert.equal(
    h.reads.some((path) => path.startsWith('places/')),
    false
  )
  for (const action of [
    'createRecipe',
    'updateRecipe',
    'createKitchenPrepItem',
  ]) {
    const h = fixture({
      retry: (records) => records.delete('apps/app/users/u'),
    })
    const input =
      action === 'createRecipe'
        ? { kitchenId: 'k', draft: { name: 'Dough' } }
        : action === 'updateRecipe'
          ? { kitchenId: 'k', recipeId: 'existing', changes: { name: 'New' } }
          : { kitchenId: 'k', draft: { name: 'Stock', source_language: 'en' } }
    await assert.rejects(h[action]({}, input), { statusCode: 403 })
    assert.equal(h.writes.length, 0)
  }
})
test('Recipe writes reject missing, conflicting, retired or foreign preparation references', async () => {
  for (const corrupt of [
    (records) => records.delete('kitchens/k/ingredients/onion'),
    (records) =>
      records.set('kitchens/k/ingredients/onion', { ingredient_id: 'other' }),
    (records) => records.delete('ingredients/onion'),
    (records) =>
      records.set('ingredients/onion', {
        name: 'Onion',
        category: 'vegetables',
        status: 'retired',
      }),
    (records) =>
      records.set('ingredients/onion', { name: '', category: 'vegetables' }),
    (records) => records.delete('kitchens/k/prep-items/sauce'),
    (records) =>
      records.set('kitchens/k/prep-items/sauce', { kitchen_id: 'other' }),
  ]) {
    const h = fixture()
    corrupt(h.records)
    await assert.rejects(
      h.updateRecipe(
        {},
        {
          kitchenId: 'k',
          recipeId: 'existing',
          changes: ready(),
        }
      ),
      { statusCode: 409 }
    )
    assert.equal(h.writes.length, 0)
  }
  const h = fixture({
    retry: (records) => records.delete('kitchens/k/ingredients/onion'),
  })
  await assert.rejects(
    h.updateRecipe(
      {},
      {
        kitchenId: 'k',
        recipeId: 'existing',
        changes: ready(),
      }
    ),
    { statusCode: 409 }
  )
  assert.equal(h.writes.length, 0)
})
test('Identity-only Recipe update does not revalidate untouched preparation; delete remains document-only', async () => {
  const h = fixture()
  h.records.get('kitchens/k/recipes/existing').preparation = ready()
  h.records.delete('kitchens/k/ingredients/onion')
  await h.updateRecipe(
    {},
    { kitchenId: 'k', recipeId: 'existing', changes: { name: 'Renamed' } }
  )
  await h.deleteRecipe({}, { kitchenId: 'k', recipeId: 'existing' })
  assert.equal(
    h.reads.some(
      (path) => path.includes('/ingredients/') || path.includes('/prep-items/')
    ),
    false
  )
  assert.deepEqual(h.writes[1], ['delete', 'kitchens/k/recipes', 'existing'])
})
test('Recipe deletion reports exact-Kitchen Item and Prep Item references without changing them', async () => {
  const dish = { name: 'Poulet rôti', spec: { recipe_ids: ['existing'] } }
  const prep = { name: 'Sauce fraîche', recipe_id: 'existing' }
  const command = { kitchenId: 'k', recipeId: 'existing' }
  for (const [path, record, label] of [
    ['dishes/roast', dish, 'Poulet rôti'],
    ['prep-items/sauce', prep, 'Sauce fraîche'],
  ]) {
    const h = fixture()
    h.records.set('kitchens/k/' + path, record)
    const before = structuredClone(h.records)
    await assert.rejects(
      h.deleteRecipe({}, command),
      (error) => error.statusCode === 409 && error.data.message.includes(label)
    )
    assert.deepEqual(h.records, before)
    assert.deepEqual(h.writes, [])
    assert.ok(h.pages.every((page) => page.limit === 100))
  }
  const h = fixture()
  h.records.set('kitchens/other/dishes/roast', dish)
  h.records.set('kitchens/other/prep-items/sauce', prep)
  h.records.set('kitchens/k/dishes/elsewhere', {
    spec: { recipe_ids: ['other'] },
  })
  await h.deleteRecipe({}, command)
  assert.deepEqual(h.writes, [['delete', 'kitchens/k/recipes', 'existing']])
  h.records.delete('kitchens/k/recipes/existing')
  assert.equal((await h.deleteRecipe({}, command)).id, 'existing')
  assert.equal(h.writes.length, 1)
  assert.equal(h.pages.length, 2)
})

test('Recipe usage reads later pages and the reference identities displayed by existing records', async () => {
  for (const [collection, recipeId, record] of [
    [
      'dishes',
      'existing',
      { name: 'Later Item', spec: { recipe_ids: [' existing '] } },
    ],
    ['prep-items', 'existing', { name: 'Later Prep', recipe_id: ' existing ' }],
    ['prep-items', '123', { name: 'Numbered Prep', recipe_id: 123 }],
  ]) {
    const h = fixture()
    h.records.set(`kitchens/k/recipes/${recipeId}`, { kitchen_id: 'k' })
    for (let index = 0; index < 100; index++)
      h.records.set(
        `kitchens/k/${collection}/filler-${String(index).padStart(3, '0')}`,
        {}
      )
    h.records.set(`kitchens/k/${collection}/z-linked`, record)
    await assert.rejects(h.deleteRecipe({}, { kitchenId: 'k', recipeId }), {
      statusCode: 409,
    })
    assert.deepEqual(h.writes, [])
    assert.ok(
      h.pages.some((page) => page.target.endsWith(collection) && page.afterId)
    )
  }
})

test('a Prep Item linked during a transaction retry keeps its Recipe', async () => {
  const h = fixture({
    retry: (records) =>
      records.set('kitchens/k/prep-items/stock', {
        name: 'Fond',
        recipe_id: 'existing',
      }),
  })
  await assert.rejects(
    h.deleteRecipe({}, { kitchenId: 'k', recipeId: 'existing' }),
    { statusCode: 409 }
  )
  assert.deepEqual(h.writes, [])
  assert.equal(h.pages.length, 4)
})

test('Prep creation snapshots inputs and rejects foreign Recipes or missing Ingredient associations', async () => {
  const wait = deferred(),
    h = fixture({ wait }),
    draft = {
      name: 'Stock',
      source_language: 'en',
      recipe_id: 'existing',
      inputs: [{ ingredient_id: 'onion', quantity: 1, unit: 'g' }],
    }
  const pending = h.createKitchenPrepItem({}, { kitchenId: 'k', draft })
  draft.inputs[0].quantity = 999
  draft.recipe_id = 'other'
  wait.resolve()
  await pending
  assert.equal(h.writes[0][3].inputs[0].quantity, 1)
  assert.equal(h.writes[0][3].recipe_id, 'existing')
  for (const corrupt of [
    (records) => records.delete('kitchens/k/recipes/existing'),
    (records) =>
      records.set('kitchens/k/recipes/existing', { kitchen_id: 'other' }),
    (records) => records.delete('kitchens/k/ingredients/onion'),
  ]) {
    const h = fixture()
    corrupt(h.records)
    await assert.rejects(
      h.createKitchenPrepItem(
        {},
        { kitchenId: 'k', draft: { ...draft, recipe_id: 'existing' } }
      ),
      { statusCode: 409 }
    )
    assert.equal(h.writes.length, 0)
  }
})

test('Recipe and Prep create reject explicitly mistyped optional fields instead of treating them as missing', async () => {
  for (const field of [
    'description',
    'names',
    'descriptions',
    'preparation',
    'method',
    'inputs',
  ]) {
    const h = fixture()
    await assert.rejects(
      h.createRecipe(
        {},
        {
          kitchenId: 'k',
          draft: { name: 'Dough', [field]: null },
        }
      ),
      { statusCode: 400 }
    )
    assert.equal(h.writes.length, 0)
  }
  for (const field of [
    'description',
    'station',
    'inputs',
    'method',
    'yield',
    'recipe_id',
    'names',
    'descriptions',
  ]) {
    const h = fixture()
    await assert.rejects(
      h.createKitchenPrepItem(
        {},
        {
          kitchenId: 'k',
          draft: { name: 'Stock', source_language: 'en', [field]: null },
        }
      ),
      { statusCode: 400 }
    )
    assert.equal(h.writes.length, 0)
  }
})

test('canonical Recipe creation leaves unknown facts absent and never overwrites a named record', async () => {
  const h = fixture()
  await h.createRecipe({}, { kitchenId: 'k', draft: { name: ' Dough ' } })
  assert.deepEqual(h.writes[0], [
    'create',
    'kitchens/k/recipes',
    'dough',
    {
      name: 'Dough',
      inputs: [],
      method: [],
      created: { by: 'u', appId: 'app' },
      updated: { by: 'u', appId: 'app' },
    },
  ])
  h.records.set('kitchens/k/recipes/dough', { name: 'Existing' })
  await assert.rejects(
    h.createRecipe({}, { kitchenId: 'k', draft: { name: 'Dough' } }),
    { statusCode: 409 }
  )
  assert.equal(h.writes.length, 1)
})
test('canonical Recipe create and update detach nested authored values before credentials', async () => {
  for (const action of ['createRecipe', 'updateRecipe']) {
    const wait = deferred(),
      h = fixture({ wait })
    const authored = { name: 'Dough', ...ready() }
    const pending = h[action](
      {},
      action === 'createRecipe'
        ? { kitchenId: 'k', draft: authored }
        : { kitchenId: 'k', recipeId: 'existing', changes: authored }
    )
    authored.inputs[0].quantity = 999
    authored.method[0] = 'Changed'
    wait.resolve()
    await pending
    assert.equal(h.writes[0][3].inputs[0].quantity, 1)
    assert.deepEqual(h.writes[0][3].method, ['Mix.'])
  }
})
test('canonical Recipe creation validates its output, disallows consuming it and rereads on retry', async () => {
  for (const draft of [
    { name: 'Recipe', output_preparation_id: 'missing' },
    {
      name: 'Recipe',
      output_preparation_id: 'sauce',
      inputs: [
        { kind: 'preparation', reference_id: 'sauce', quantity: 1, unit: 'g' },
      ],
    },
  ]) {
    const h = fixture()
    await assert.rejects(h.createRecipe({}, { kitchenId: 'k', draft }))
    assert.deepEqual(h.writes, [])
  }
  const h = fixture({
    retry: (records) => records.delete('kitchens/k/prep-items/sauce'),
  })
  await assert.rejects(
    h.createRecipe(
      {},
      {
        kitchenId: 'k',
        draft: { name: 'Recipe', output_preparation_id: 'sauce' },
      }
    ),
    { statusCode: 409 }
  )
  assert.deepEqual(h.writes, [])
})
