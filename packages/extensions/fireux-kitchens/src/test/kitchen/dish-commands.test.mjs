import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
function load(path, dependencies, name) {
  dependencies = commandScopeDeps({ isFirestoreDocumentId, ...dependencies })
  if (name === 'useDishMutation' && !dependencies.useDishEditorScope)
    dependencies.useDishEditorScope = load(
      '../../runtime/kitchen/composables/dish/useDishEditorScope.ts',
      dependencies,
      'useDishEditorScope'
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
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const readMembershipAccessIds = load(
  '../../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
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
    FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens', places: 'places' },
    readKitchenAccessIds,
    isAppUserSubscription: (value) =>
      ['free', 'premium', 'business'].includes(value),
    createError,
  },
  'requireKitchenRecordMutationAuthority'
)
const specification = load(
  '../../runtime/kitchen/utils/dish-specification.ts',
  { isFirestoreDocumentId },
  '({emptyDishSpecification,validateDishSpecification})'
)
const recordInput = load(
  '../../runtime/kitchen/server/dishes/record-input.ts',
  { createError },
  '({dishFields,dishText,validateDishInput})'
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
    FIRESTORE_MUTATION_TARGETS: { ingredients: 'ingredients' },
  },
  '({requireKitchenIngredientReferences,requireKitchenPrepItemReferences,requireKitchenRecipeReference})'
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
    ...recordInput,
    ...specification,
    ...references,
    createError,
    requireFirestoreDocumentId,
    requireKitchenRecordMutationAuthority,
    normalizeSlug: (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    dishCategories: [{ value: 'main' }],
    serverKitchenDishesTarget: (id) => `dishes/${id}`,
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
        `../../runtime/kitchen/server/dishes/${action}.ts`,
        dependencies,
        `({${action}Dish})`
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
      await h.createDish(
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
      h.createDish({}, { kitchenId: 'k', draft: { name: 'Cola' } }),
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
  await h.updateDish(
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
  await h.deleteDish({}, { kitchenId: 'k', dishId: 'existing' })
  assert.deepEqual(h.writes[1], ['delete', 'dishes/k', 'existing'])
})
test('all commands enforce transaction-time current membership and bound Kitchen grant', async () => {
  for (const action of ['createDish', 'updateDish', 'deleteDish'])
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
        action === 'createDish'
          ? { kitchenId: 'k', draft: { name: 'New' } }
          : action === 'updateDish'
            ? { kitchenId: 'k', dishId: 'existing', changes: { name: 'New' } }
            : { kitchenId: 'k', dishId: 'existing' }
      await assert.rejects(h[action]({}, input))
      assert.equal(h.writes.length, 0)
    }
})
test('update rejects protected/unknown fields, malformed spec and missing records', async () => {
  for (const changes of [
    { image: 'url' },
    { kitchen_id: 'other' },
    { updated: {} },
    { item_kind: 'drink' },
    {},
    { category: 'bad' },
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
      h.updateDish({}, { kitchenId: 'k', dishId: 'existing', changes })
    )
    assert.equal(h.writes.length, 0)
  }
  const h = harness()
  await assert.rejects(
    h.updateDish(
      {},
      { kitchenId: 'k', dishId: 'missing', changes: { name: 'New' } }
    ),
    { statusCode: 404 }
  )
})
test('Dish transport snapshots nested input and invalidates account/Kitchen round trips across waits', async () => {
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
      const useDishMutation = load(
        '../../runtime/kitchen/composables/dish/useDishMutation.ts',
        {
          onBeforeUnmount: (fn) => disposed.push(fn),
          watch,
          useRoute: () => ({
            get fullPath() {
              return routePath.value
            },
          }),
          useAuth: () => ({ currentUser }),
          useRequireUser: () => auth,
          useKitchenWorkspaceSelection: () => ({ selectedId }),
          useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
          $fetch: (...args) => {
            calls.push(args)
            return response
          },
        },
        'useDishMutation'
      )
      const input = { draft: { name: 'Cola' } },
        pending = useDishMutation().mutate('POST', input, 'k')
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
  const useDishMutation = () => ({
    mutate: async (...args) => {
      calls.push(args)
      return { id: 'dish' }
    },
  })
  const create = load(
    '../../runtime/kitchen/composables/dish/useDishCreate.ts',
    { useDishMutation },
    'useDishCreate'
  )()
  const update = load(
    '../../runtime/kitchen/composables/dish/useDishUpdate.ts',
    { useDishMutation },
    'useDishUpdate'
  )()
  const remove = load(
    '../../runtime/kitchen/composables/dish/useDishDelete.ts',
    { useDishMutation },
    'useDishDelete'
  )()
  await create.createDish({ name: 'Dish' }, { kitchenId: 'k' })
  await update.updateDish('dish', { description: 'Copy' }, { kitchenId: 'k' })
  await remove.deleteDish('dish', { kitchenId: 'k' })
  assert.deepEqual(calls, [
    ['POST', { draft: { name: 'Dish' } }, 'k'],
    ['PATCH', { dishId: 'dish', changes: { description: 'Copy' } }, 'k'],
    ['DELETE', { dishId: 'dish' }, 'k'],
  ])
})

test('Dish creates snapshot validated flags and text before credentials and do not require a Place', async () => {
  const wait = deferred(),
    h = harness({ wait })
  const draft = {
    name: 'Cola',
    description: 'Drink',
    item_kind: 'drink',
    is_deal: true,
  }
  const pending = h.createDish({}, { kitchenId: 'k', draft })
  draft.is_deal = { corrupt: true }
  draft.description = 'Wrong'
  draft.item_kind = 'food'
  wait.resolve()
  await pending
  assert.equal(h.writes[0][3].is_deal, true)
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
test('Dish specifications reject explicit null/coercion and detach every nested field before credentials', async () => {
  for (const field of ['description', 'item_kind', 'is_deal', 'is_flagship']) {
    const h = harness()
    await assert.rejects(
      h.createDish(
        {},
        { kitchenId: 'k', draft: { name: 'Dish', [field]: null } }
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
      h.updateDish(
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
  const pending = h.updateDish(
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
test('Dish specification commit reads exact Kitchen associations and rejects missing, retired or foreign components including retries', async () => {
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
        h.updateDish(
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
test('Dish identity-only updates leave untouched links alone and document-only deletion is idempotent', async () => {
  const h = harness()
  h.records.get('dishes/k/existing').spec = linkedSpec()
  h.records.delete('kitchens/k/ingredients/flour')
  await h.updateDish(
    {},
    {
      kitchenId: 'k',
      dishId: 'existing',
      changes: { description: 'Fresh copy' },
    }
  )
  await h.deleteDish({}, { kitchenId: 'k', dishId: 'missing' })
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

test('Dish update rejects a foreign stored Kitchen without changing identity or specification', async () => {
  const h = harness()
  h.records.get('dishes/k/existing').kitchen_id = 'other'
  await assert.rejects(
    h.updateDish(
      {},
      { kitchenId: 'k', dishId: 'existing', changes: { name: 'Changed' } }
    ),
    { statusCode: 409 }
  )
  assert.equal(h.writes.length, 0)
})
