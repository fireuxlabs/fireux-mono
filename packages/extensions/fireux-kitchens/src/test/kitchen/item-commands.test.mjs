import { validateItemReferenceIds } from '../../runtime/kitchen/utils/item-preparation.ts'
import { readAppUserSubscription } from '../../../../../core/fireux-core/src/runtime/app/app-user/utils/validation.ts'
import { itemPricingHelpers } from '../helpers/item-pricing.mjs'
import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read'
function load(path, dependencies, name) {
  dependencies = { ...itemPricingHelpers, ...dependencies }

  dependencies = commandScopeDeps({ isFirestoreDocumentId, ...dependencies })
  if (name === 'useItemMutation' && !dependencies.useItemEditorScope)
    dependencies.useItemEditorScope = load(
      '../../runtime/kitchen/composables/item/useItemEditorScope.ts',
      dependencies,
      'useItemEditorScope'
    )
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const usageTargets = {
  serverKitchenMenusTarget: (k) => `kitchens/${k}/menus`,
  serverKitchenMenuSectionsTarget: (k, m) =>
    `kitchens/${k}/menus/${m}/sections`,
  serverKitchenMenuItemsTarget: (k, m, s) =>
    `kitchens/${k}/menus/${m}/sections/${s}/items`,
  kitchenPromotionsTarget: (k) => `kitchens/${k}/promotions`,
}
const readItemUsage = load(
  '../../runtime/kitchen/server/items/usage.ts',
  { ...usageTargets, createError, readRecordString },
  'readItemUsage'
)

const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const readMembershipAccessIds = load(
  '../../../../../core/fireux-core/src/runtime/app/app-user/utils/membership-access.ts',
  {},
  'readMembershipAccessIds'
)
const readKitchenAccessIds = load(
  '../../runtime/kitchen/utils/kitchen-access.ts',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 },
  'readKitchenAccessIds'
)
const requireKitchenRecordMutationAuthority = load(
  '../../runtime/kitchen/server/core/mutation-authority.ts',
  {
    serverAppUsersTarget: (app) => `apps/${app}/users`,
    serverKitchenAccessTarget: (app) => 'kitchen_access',
    KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
    PLACE_MUTATION_TARGETS: { places: 'places' },
    readKitchenAccessIds,
    readAppUserSubscription,
    createError,
  },
  'requireKitchenRecordMutationAuthority'
)
const specification = load(
  '../../runtime/kitchen/utils/item-specification.ts',
  { isFirestoreDocumentId },
  '({emptyItemSpecification,validateItemSpecification})'
)
const recordInput = load(
  '../../runtime/kitchen/server/items/record-input.ts',
  { createError },
  '({itemFields,itemText,validateItemInput})'
)
const taxonomy = load(
  '../../runtime/ingredient/models/ingredient-taxonomy.ts',
  {},
  '({INGREDIENT_CATEGORIES})'
)
const migration = load(
  '../../runtime/ingredient/server/category-migration.ts',
  taxonomy,
  '({readIngredientCategory})'
)
const catalogue = load(
  '../../runtime/ingredient/server/normalize.ts',
  {
    ...migration,
    isFirestoreDocumentId,
    IngredientDefaults: { created: {}, updated: {} },
  },
  '({isActiveIngredient,normalizeIngredient,normalizeIngredientAliases})'
)
const references = load(
  '../../runtime/kitchen/server/core/preparation-references.ts',
  {
    ...catalogue,
    createError,
    defineFirestoreMutationTarget: (x) => x.collectionPath,
    INGREDIENT_MUTATION_TARGETS: { ingredients: 'ingredients' },
  },
  '({requireKitchenIngredientReferences,requireKitchenPrepItemReferences,requireKitchenRecipeReference})'
)
const requireItemPreparationStations = load(
  '../../runtime/kitchen/server/stations/item-references.ts',
  {
    createError,
    kitchenItemGroupsTarget: (k) => `kitchens/${k}/item-groups`,
    kitchenStationsTarget: (k) => `kitchens/${k}/stations`,
  },
  'requireItemPreparationStations'
)
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function harness({ wait, retry } = {}) {
  const at = { seconds: 1, nanoseconds: 0 },
    writes = [],
    reads = []
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
    ['dishes/k/existing', { name: 'Existing', image: 'keep', kitchen_id: 'k' }],
    ['kitchens/k/ingredients/flour', { ingredient_id: 'flour' }],
    ['ingredients/flour', { name: 'Flour', category: 'grains-pasta-pulses' }],
    ['kitchens/k/prep-items/sauce', { name: 'Sauce', kitchen_id: 'k' }],
    ['kitchens/k/recipes/dough', { name: 'Dough', kitchen_id: 'k' }],
  ])
  let before = () => {}
  const dependencies = {
    readItemUsage,
    validateItemReferenceIds,
    requireItemPreparationStations,
    ...recordInput,
    ...specification,
    ...references,
    createError,
    requireFirestoreDocumentId,
    requireKitchenRecordMutationAuthority,
    normalizeSlug: (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    serverKitchenItemsTarget: (id) => `dishes/${id}`,
    readKitchenMutationActor: async () => {
      await wait?.promise
      return { uid: 'u', runtimeAppId: 'app' }
    },
    serverAuditStamp: (x) => x,
    runGuardedServerTransaction: async (_, work) => {
      before()
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
            assert.equal(writing, false)
            reads.push(target)
            return [...records]
              .filter(
                ([path]) =>
                  path.startsWith(target + '/') &&
                  !path.slice(target.length + 1).includes('/') &&
                  (!afterId || path.split('/').at(-1) > afterId)
              )
              .sort(([left], [right]) => left.localeCompare(right))
              .slice(0, limit)
              .map(([path, data]) => ({ id: path.split('/').at(-1), data }))
          },
          query: async (target, input) => {
            assert.equal(writing, false)
            reads.push(target)
            return [...records]
              .filter(
                ([path, data]) =>
                  path.startsWith(target + '/') &&
                  !path.slice(target.length + 1).includes('/') &&
                  data[input.field] === input.value
              )
              .slice(0, input.limit)
              .map(([path, data]) => ({ id: path.split('/').at(-1), data }))
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
        if (commit) {
          writes.push(...staged.map((row) => structuredClone(row)))
          for (const [verb, target, id, data] of staged)
            if (verb === 'create') records.set(`${target}/${id}`, data)
        }
        return result
      }
      if (retry) {
        await run(false)
        retry(records)
      }
      return run(true)
    },
  }
  const commands = Object.assign(
    {},
    ...['create', 'update', 'delete'].map((action) =>
      load(
        `../../runtime/kitchen/server/items/${action}.ts`,
        dependencies,
        `({${action}Item})`
      )
    )
  )
  return {
    ...commands,
    records,
    writes,
    reads,
    before: (fn) => {
      before = fn
    },
  }
}
test('food and drink create atomically; duplicate cannot overwrite; media and flagship remain separate', async () => {
  for (const item_kind of ['food', 'drink']) {
    const h = harness()
    assert.deepEqual(
      await h.createItem(
        {},
        {
          kitchenId: 'k',
          draft: { name: 'Cola', item_kind, is_flagship: true },
        }
      ),
      { id: 'cola' }
    )
    const data = h.writes[0][3]
    assert.equal(data.item_kind, item_kind)
    assert.equal(data.image, '')
    assert.equal(data.is_flagship, false)
    assert.deepEqual(data.created, { by: 'u', appId: 'app' })
    await assert.rejects(
      h.createItem({}, { kitchenId: 'k', draft: { name: 'Cola' } }),
      { statusCode: 409 }
    )
    assert.equal(h.writes.length, 1)
  }
})
test('update validates nested specification; deletion remains document-only', async () => {
  const h = harness()
  const spec = {
    portion: 1,
    station: '',
    ingredients: [
      { ingredient_id: 'flour', quantity: 100, unit: 'g', note: '' },
    ],
    prep_items: [],
    recipe_ids: ['dough'],
    assembly: ['Bake'],
    source_note: '',
  }
  await h.updateItem(
    {},
    {
      kitchenId: 'k',
      dishId: 'existing',
      changes: { name: ' New ', category: 'main', spec },
    }
  )
  assert.equal(h.writes[0][3].name, 'New')
  assert.deepEqual(h.writes[0][3].spec, spec)
  assert.equal('image' in h.writes[0][3], false)
  await h.deleteItem({}, { kitchenId: 'k', dishId: 'existing' })
  assert.deepEqual(h.writes[1], ['delete', 'dishes/k', 'existing'])
})
test('all commands enforce transaction-time current membership and bound Kitchen grant', async () => {
  for (const action of ['createItem', 'updateItem', 'deleteItem'])
    for (const change of [
      (h) => h.records.delete('apps/app/users/u'),
      (h) => {
        h.records.get('apps/app/users/u').created.at = {
          seconds: 2,
          nanoseconds: 0,
        }
      },
      (h) => {
        h.records.get('kitchen_access/u').apps.app.ids = ['other']
      },
      (h) => h.records.delete('kitchen_access/u'),
    ]) {
      const h = harness()
      h.before(() => change(h))
      const input =
        action === 'createItem'
          ? { kitchenId: 'k', draft: { name: 'New' } }
          : action === 'updateItem'
            ? { kitchenId: 'k', dishId: 'existing', changes: { name: 'New' } }
            : { kitchenId: 'k', dishId: 'existing' }
      await assert.rejects(h[action]({}, input))
      assert.equal(h.writes.length, 0)
    }
})
test('Item categories accept operator vocabulary and can be cleared', async () => {
  for (const [category, expected] of [
    ['  House favourites  ', 'House favourites'],
    ['', ''],
    ['main', 'main'],
  ]) {
    const h = harness()
    await h.updateItem(
      {},
      { kitchenId: 'k', dishId: 'existing', changes: { category } }
    )
    assert.equal(h.writes[0][3].category, expected)
  }
})
test('update rejects protected/unknown fields, malformed spec and missing records', async () => {
  for (const changes of [
    { image: 'url' },
    { kitchen_id: 'other' },
    { updated: {} },
    { item_kind: 'drink' },
    {},
    { category: 42 },
    { name: '' },
    {
      spec: {
        portion: 1,
        ingredients: {},
        prep_items: [],
        recipe_ids: [],
        assembly: [],
      },
    },
    { spec: { portion: -1 } },
  ]) {
    const h = harness()
    await assert.rejects(
      h.updateItem({}, { kitchenId: 'k', dishId: 'existing', changes })
    )
    assert.equal(h.writes.length, 0)
  }
  const h = harness()
  await assert.rejects(
    h.updateItem(
      {},
      { kitchenId: 'k', dishId: 'missing', changes: { name: 'New' } }
    ),
    { statusCode: 404 }
  )
})
test('Item transport snapshots nested input and invalidates account/Kitchen round trips across waits', async () => {
  for (const stage of ['auth', 'token', 'response'])
    for (const scope of [
      'stable',
      'kitchen',
      'account',
      'signout',
      'route',
      'dispose',
    ]) {
      let resolveUser, resolveToken, resolveResponse
      const auth = new Promise((r) => {
          resolveUser = r
        }),
        token = new Promise((r) => {
          resolveToken = r
        }),
        response = new Promise((r) => {
          resolveResponse = r
        })
      const user = { uid: 'u', getIdToken: () => token },
        currentUser = ref(user),
        selectedId = ref('k'),
        routePath = ref('/dishes/cola'),
        calls = [],
        disposed = []
      const useItemMutation = load(
        '../../runtime/kitchen/composables/item/useItemMutation.ts',
        {
          onBeforeUnmount: (fn) => disposed.push(fn),
          watch,
          useAuth: () => ({ currentUser }),
          useRequireUser: () => auth,
          $fetch: (...args) => {
            calls.push(args)
            return response
          },
        },
        'useItemMutation'
      )
      const input = { draft: { name: 'Cola' } },
        pending = useItemMutation([selectedId, routePath]).mutate(
          'POST',
          input,
          'k'
        )
      const done =
        scope === 'stable' || stage === 'response'
          ? pending
          : assert.rejects(pending, /changed/)
      if (stage !== 'auth') {
        resolveUser(user)
        await Promise.resolve()
      }
      if (stage === 'response') {
        resolveToken('token')
        await Promise.resolve()
      }
      if (scope === 'dispose') disposed.forEach((fn) => fn())
      if (scope === 'route') {
        routePath.value = '/dishes/other'
        routePath.value = '/dishes/cola'
      }
      if (scope === 'kitchen') {
        selectedId.value = 'other'
        selectedId.value = 'k'
      }
      if (scope === 'account' || scope === 'signout') {
        currentUser.value = scope === 'signout' ? null : { uid: 'other' }
        currentUser.value = user
      }
      input.draft.name = 'Changed'
      resolveUser(user)
      resolveToken('token')
      resolveResponse({ id: 'cola' })
      await done
      assert.equal(
        calls.length,
        scope === 'stable' || stage === 'response' ? 1 : 0
      )
      if (calls.length) assert.equal(calls[0][1].body.draft.name, 'Cola')
    }
})

test('existing three public adapters retain caller signatures and choose exact command envelopes', async () => {
  const calls = []
  const useItemMutation = () => ({
    mutate: async (...args) => {
      calls.push(args)
      return { id: 'dish' }
    },
  })
  const create = load(
    '../../runtime/kitchen/composables/item/useItemCreate.ts',
    { useItemMutation },
    'useItemCreate'
  )()
  const update = load(
    '../../runtime/kitchen/composables/item/useItemUpdate.ts',
    { useItemMutation },
    'useItemUpdate'
  )()
  const remove = load(
    '../../runtime/kitchen/composables/item/useItemDelete.ts',
    { useItemMutation },
    'useItemDelete'
  )()
  await create.createItem({ name: 'Item' }, { kitchenId: 'k' })
  await update.updateItem('dish', { description: 'Copy' }, { kitchenId: 'k' })
  await remove.deleteItem('dish', { kitchenId: 'k' })
  assert.deepEqual(calls, [
    ['POST', { draft: { name: 'Item' } }, 'k'],
    ['PATCH', { dishId: 'dish', changes: { description: 'Copy' } }, 'k'],
    ['DELETE', { dishId: 'dish' }, 'k'],
  ])
})

test('Item creates snapshot validated flags and text before credentials and do not require a Place', async () => {
  const wait = deferred(),
    h = harness({ wait })
  const draft = {
    name: 'Cola',
    description: 'Drink',
    item_kind: 'drink',
    is_flagship: true,
  }
  const pending = h.createItem({}, { kitchenId: 'k', draft })
  draft.is_flagship = { corrupt: true }
  draft.description = 'Wrong'
  draft.item_kind = 'food'
  wait.resolve()
  await pending
  assert.equal(Object.hasOwn(h.writes[0][3], 'is_deal'), false)
  assert.equal(h.writes[0][3].is_flagship, false)
  assert.equal(h.writes[0][3].description, 'Drink')
  assert.equal(h.writes[0][3].item_kind, 'drink')
  assert.equal(
    h.reads.some((path) => path.startsWith('places/')),
    false
  )
})
const linkedSpec = () => ({
  portion: 1,
  station: '',
  ingredients: [{ ingredient_id: 'flour', quantity: 100, unit: 'g', note: '' }],
  prep_items: [
    { prep_item_id: 'sauce', quantity: 1, unit: 'portion', note: '' },
  ],
  recipe_ids: ['dough'],
  assembly: ['Bake'],
  source_note: '',
})
test('Item specifications reject explicit null/coercion and detach every nested field before credentials', async () => {
  for (const field of ['description', 'item_kind', 'is_deal', 'is_flagship']) {
    const h = harness()
    await assert.rejects(
      h.createItem(
        {},
        { kitchenId: 'k', draft: { name: 'Item', [field]: null } }
      ),
      { statusCode: 400 }
    )
    assert.equal(h.writes.length, 0)
  }
  for (const spec of [
    null,
    { ...linkedSpec(), portion: '1' },
    { ...linkedSpec(), station: null },
    { ...linkedSpec(), source_note: null },
    { ...linkedSpec(), unknown: true },
    { ...linkedSpec(), recipe_ids: ['.'] },
    { ...linkedSpec(), assembly: [false] },
    {
      ...linkedSpec(),
      ingredients: [
        { ingredient_id: 'flour', quantity: 1, unit: 'g', note: null },
      ],
    },
    {
      ...linkedSpec(),
      prep_items: [{ prep_item_id: 'sauce', quantity: '1', unit: 'g' }],
    },
  ]) {
    const h = harness()
    await assert.rejects(
      h.updateItem(
        {},
        { kitchenId: 'k', dishId: 'existing', changes: { spec } }
      ),
      { statusCode: 400 }
    )
    assert.equal(h.writes.length, 0)
  }
  const wait = deferred(),
    h = harness({ wait }),
    spec = linkedSpec()
  const pending = h.updateItem(
    {},
    { kitchenId: 'k', dishId: 'existing', changes: { spec } }
  )
  spec.ingredients[0].quantity = 999
  spec.prep_items[0].prep_item_id = 'other'
  spec.recipe_ids[0] = 'other'
  spec.assembly[0] = 'Wrong'
  wait.resolve()
  await pending
  assert.deepEqual(h.writes[0][3].spec, linkedSpec())
})
test('Item specification commit reads exact Kitchen associations and rejects missing, retired or foreign components including retries', async () => {
  for (const corrupt of [
    (records) => records.delete('kitchens/k/ingredients/flour'),
    (records) =>
      records.set('kitchens/k/ingredients/flour', { ingredient_id: 'other' }),
    (records) => records.delete('ingredients/flour'),
    (records) =>
      records.set('ingredients/flour', {
        name: 'Flour',
        category: 'grains-pasta-pulses',
        status: 'retired',
      }),
    (records) => records.delete('kitchens/k/prep-items/sauce'),
    (records) =>
      records.set('kitchens/k/prep-items/sauce', { kitchen_id: 'other' }),
    (records) => records.delete('kitchens/k/recipes/dough'),
    (records) =>
      records.set('kitchens/k/recipes/dough', { kitchen_id: 'other' }),
  ]) {
    for (const retry of [false, true]) {
      const h = harness(retry ? { retry: corrupt } : {})
      if (!retry) corrupt(h.records)
      await assert.rejects(
        h.updateItem(
          {},
          {
            kitchenId: 'k',
            dishId: 'existing',
            changes: { spec: linkedSpec() },
          }
        ),
        { statusCode: 409 }
      )
      assert.equal(h.writes.length, 0)
    }
  }
})
test('Item identity-only updates leave untouched links alone and document-only deletion is idempotent', async () => {
  const h = harness()
  h.records.get('dishes/k/existing').spec = linkedSpec()
  h.records.delete('kitchens/k/ingredients/flour')
  await h.updateItem(
    {},
    {
      kitchenId: 'k',
      dishId: 'existing',
      changes: { description: 'Fresh copy' },
    }
  )
  await h.deleteItem({}, { kitchenId: 'k', dishId: 'missing' })
  assert.equal(
    h.reads.some(
      (path) =>
        path.includes('/ingredients/') ||
        path.includes('/prep-items/') ||
        path.includes('/recipes/')
    ),
    false
  )
  assert.deepEqual(h.writes[1], ['delete', 'dishes/k', 'missing'])
})

test('Item update rejects a foreign stored Kitchen without changing identity or specification', async () => {
  const h = harness()
  h.records.get('dishes/k/existing').kitchen_id = 'other'
  await assert.rejects(
    h.updateItem(
      {},
      { kitchenId: 'k', dishId: 'existing', changes: { name: 'Changed' } }
    ),
    { statusCode: 409 }
  )
  assert.equal(h.writes.length, 0)
})

test('Item creation rejects the removed deal flag before any write', async () => {
  const h = harness()
  await assert.rejects(
    h.createItem(
      {},
      { kitchenId: 'k', draft: { name: 'Item', is_deal: true } }
    ),
    { statusCode: 400 }
  )
  assert.equal(h.writes.length, 0)
})

for (const reference of [
  'active Menu',
  'archived Menu',
  'paused offer',
  'meal deal',
]) {
  test(`Item deletion is blocked by ${reference} and leaves all records unchanged`, async () => {
    const h = harness()
    if (reference.includes('Menu')) {
      h.records.set('kitchens/k/menus/m', {
        name: 'Food',
        slug: 'food',
        status: reference.startsWith('archived') ? 'archived' : 'published',
      })
      h.records.set('kitchens/k/menus/m/sections/s', {
        label: 'Pizza',
        status: 'archived',
      })
      h.records.set('kitchens/k/menus/m/sections/s/items/i', {
        dish_id: 'existing',
        status: 'archived',
      })
    } else
      h.records.set(
        'kitchens/k/promotions/p',
        reference === 'meal deal'
          ? {
              name: 'Meal',
              groups: [{ dishes: [{ dishId: 'existing', supplement: 0 }] }],
            }
          : {
              name: 'Sunday',
              status: 'paused',
              dishes: [{ dishId: 'existing', price: 11 }],
            }
      )
    const before = structuredClone(h.records)
    await assert.rejects(
      h.deleteItem({}, { kitchenId: 'k', dishId: 'existing' }),
      (error) => error.statusCode === 409 && error.data.usages.length === 1
    )
    assert.deepEqual(h.records, before)
    assert.deepEqual(h.writes, [])
    assert.ok(h.reads.every((path) => !path.includes('orders')))
  })
}

test('Item deletion rechecks references on transaction retry', async () => {
  const h = harness({
    retry: (records) => {
      records.set('kitchens/k/promotions/p', {
        name: 'New deal',
        groups: [{ dishes: [{ dishId: 'existing' }] }],
      })
    },
  })
  await assert.rejects(
    h.deleteItem({}, { kitchenId: 'k', dishId: 'existing' }),
    { statusCode: 409 }
  )
  assert.deepEqual(h.writes, [])
})

test('Item deletion never scans another Kitchen', async () => {
  const h = harness()
  h.records.set('kitchens/other/promotions/p', {
    name: 'Other',
    dishes: [{ dishId: 'existing', price: 11 }],
  })
  await h.deleteItem({}, { kitchenId: 'k', dishId: 'existing' })
  assert.equal(h.writes[0][0], 'delete')
  assert.ok(h.reads.every((path) => !path.includes('kitchens/other')))
})

test('Item deletion refuses an incomplete usage scan', async () => {
  const h = harness()
  for (let index = 0; index < 1000; index++)
    h.records.set(`kitchens/k/promotions/${index}`, { dishes: [] })
  await assert.rejects(
    h.deleteItem({}, { kitchenId: 'k', dishId: 'existing' }),
    /Too many records/
  )
  assert.deepEqual(h.writes, [])
})

test('Item deletion protects every reference that Menu rendering resolves, including later pages', async () => {
  const readKitchenMenuSections = load(
    '../../runtime/menu/server/manifest/sections.ts',
    { readRecord, readRecordString, readLegacyItemKind: () => 'food' },
    'readKitchenMenuSections'
  )
  for (const [reference, offset] of [
    ['existing', 0],
    ['existing', 1000],
    [' existing ', 0],
    ['\texisting\u00a0', 100],
    [' existing ', 1000],
  ]) {
    const h = harness()
    h.records.get('dishes/k/existing').price = 8
    h.records.set('kitchens/k/menus/m', { name: 'Lunch', slug: 'lunch' })
    h.records.set('kitchens/k/menus/m/sections/s', { label: 'Main' })
    const items = 'kitchens/k/menus/m/sections/s/items'
    for (let index = 0; index < offset; index++)
      h.records.set(items + '/' + String(index).padStart(4, '0'), {
        dish_id: 'unrelated',
      })
    h.records.set(items + '/target', { dish_id: reference })
    const db = {
      collection(path) {
        const target = path === 'kitchens/k/dishes' ? 'dishes/k' : path
        return {
          get: async () => ({
            docs: [...h.records]
              .filter(
                ([path]) =>
                  path.startsWith(target + '/') &&
                  !path.slice(target.length + 1).includes('/')
              )
              .map(([path, data]) => ({
                id: path.split('/').at(-1),
                data: () => data,
              })),
          }),
        }
      },
    }
    const before = await readKitchenMenuSections(db, {
      appId: 'app',
      kitchenId: 'k',
      menuId: 'm',
    })
    assert.deepEqual(
      before[0].items.map((item) => item.name),
      ['Existing']
    )
    await assert.rejects(
      h.deleteItem({}, { kitchenId: 'k', dishId: 'existing' }),
      {
        statusCode: 409,
      }
    )
    assert.deepEqual(h.writes, [])
    assert.equal(h.records.has('dishes/k/existing'), true)
    assert.equal(
      h.reads.filter((target) => target === items).length,
      reference === 'existing' ? 1 : 2 + Math.floor(offset / 100)
    )
  }
})

test('Item deletion completes all item pages before deciding a Menu has no reference', async () => {
  const h = harness()
  h.records.set('kitchens/k/menus/m', { name: 'Lunch', slug: 'lunch' })
  h.records.set('kitchens/k/menus/m/sections/s', { label: 'Main' })
  const items = 'kitchens/k/menus/m/sections/s/items'
  for (let index = 0; index < 1001; index++)
    h.records.set(items + '/' + String(index).padStart(4, '0'), {
      dish_id: 'unrelated',
    })
  await h.deleteItem({}, { kitchenId: 'k', dishId: 'existing' })
  assert.deepEqual(h.writes, [['delete', 'dishes/k', 'existing']])
  assert.equal(h.reads.filter((target) => target === items).length, 12)
})

test('Item creation preserves unset, explicit zero and normal prices without changing existing records', async () => {
  for (const price of [undefined, 0, 13]) {
    const h = harness()
    await h.createItem(
      {},
      {
        kitchenId: 'k',
        draft: { name: 'New item', ...(price === undefined ? {} : { price }) },
      }
    )
    const data = h.writes[0][3]
    assert.equal(Object.hasOwn(data, 'price'), price !== undefined)
    assert.equal(data.price, price)
  }
  for (const price of [null, '', -1, NaN]) {
    const h = harness()
    await assert.rejects(
      h.createItem({}, { kitchenId: 'k', draft: { name: 'Bad price', price } }),
      { statusCode: 400 }
    )
    assert.equal(h.writes.length, 0)
  }
})

test('Item completion refreshes Menu projections without invalidating the editor session', async () => {
  const currentUser = ref({ uid: 'operator', getIdToken: async () => 'token' })
  let refreshed = []
  const factory = load(
    '../../runtime/kitchen/composables/item/useItemMutation.ts',
    {
      watch,
      useAuth: () => ({ currentUser }),
      useRequireUser: async () => currentUser.value,
      useNuxtApp: () => ({
        payload: {
          data: Object.fromEntries(
            [
              'menu|id=food',
              'menu-collection|app=misebox',
              '["app-read","misebox-app","operator"]',
              'users:public',
            ].map((key) => [key, {}])
          ),
        },
      }),
      refreshNuxtData: async (keys) => {
        refreshed = keys
      },
      $fetch: async (_url, options) => {
        await options.onResponse({ options, response: { ok: true } })
        return { id: 'test-dish' }
      },
    },
    'useItemMutation'
  )
  const result = await factory().mutate(
    'POST',
    { draft: { name: 'TEST', price: 8.5 } },
    'k'
  )
  assert.equal(result.id, 'test-dish')
  assert.deepEqual(refreshed, ['menu|id=food', 'menu-collection|app=misebox'])
})

test('new Items need no Food/Drink type; group and Station references are checked before writes', async () => {
  const h = harness()
  h.records.set('kitchens/k/item-groups/merch', {
    kitchen_id: 'k',
    active: true,
  })
  h.records.set('kitchens/k/stations/bar', {
    kitchen_id: 'k',
    active: true,
    role: 'preparation',
  })
  await h.createItem(
    {},
    {
      kitchenId: 'k',
      draft: {
        name: 'Umbrella',
        preparation_station_ids: [],
      },
    }
  )
  const created = h.writes.at(-1)[3]
  assert.equal(created.item_kind, null)
  assert.deepEqual(created.preparation_station_ids, [])
  await h.updateItem(
    {},
    {
      kitchenId: 'k',
      dishId: 'existing',
      changes: { preparation_station_ids: ['bar'] },
    }
  )
  assert.deepEqual(h.writes.at(-1)[3].preparation_station_ids, ['bar'])
  await h.updateItem(
    {},
    {
      kitchenId: 'k',
      dishId: 'existing',
      changes: { preparation_station_ids: null },
    }
  )
  assert.equal(h.writes.at(-1)[3].preparation_station_ids, null)
  const count = h.writes.length
  await assert.rejects(
    h.updateItem(
      {},
      {
        kitchenId: 'k',
        dishId: 'existing',
        changes: { preparation_station_ids: ['foreign'] },
      }
    ),
    /preparation Station/
  )
  assert.equal(h.writes.length, count)
})

test('choice groups use the existing authorized Item update and derive a full-price group minimum', async () => {
  const groups = [
    {
      id: 'size',
      name: 'Size',
      min: 1,
      max: 1,
      pricing: 'full',
      options: [
        { id: 'small', label: 'Small', price: 12 },
        { id: 'large', label: 'Large', price: 18 },
      ],
    },
  ]
  const h = harness()
  await h.updateItem(
    {},
    {
      kitchenId: 'k',
      dishId: 'existing',
      changes: {
        price: 0,
        choice_groups: groups,
        price_options: [],
        add_ons: [],
      },
    }
  )
  assert.equal(h.writes[0][3].price, 12)
  assert.deepEqual(h.writes[0][3].choice_groups, groups)
  const denied = harness()
  denied.records.delete('apps/app/users/u')
  await assert.rejects(
    denied.updateItem(
      {},
      { kitchenId: 'k', dishId: 'existing', changes: { choice_groups: groups } }
    )
  )
  assert.equal(denied.writes.length, 0)
})
