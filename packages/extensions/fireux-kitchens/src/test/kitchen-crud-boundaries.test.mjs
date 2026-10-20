import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(path, names, deps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export type \{[^\n]+\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const { readMembershipAccessIds } = load(
  '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  'readMembershipAccessIds'
)
const { readKitchenAccessIds } = load(
  '../runtime/kitchen/utils/kitchen-access.ts',
  'readKitchenAccessIds',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 }
)
const authority = load(
  '../runtime/kitchen/server/core/mutation-authority.ts',
  'requireKitchenRecordMutationAuthority,requireKitchenMutationAuthority',
  {
    createError: ({ statusMessage, statusCode }) =>
      Object.assign(new Error(statusMessage), { statusCode }),
    serverAppUsersTarget: (id) => `apps/${id}/users`,
    serverKitchenAccessTarget: () => 'kitchen_access',
    FIRESTORE_MUTATION_TARGETS: { kitchens: 'kitchens', places: 'places' },
    isAppUserSubscription: (value) => value === 'free',
    readKitchenAccessIds,
  }
)
const at = { seconds: 100, nanoseconds: 1 }
const member = { role: 'user', subscription: 'free', created: { at } }
const access = { ids: ['mine'], membership_created_at: at }
function transaction(overrides = {}) {
  const docs = {
    'kitchens/mine': { name: 'Name-only Kitchen' },
    'apps/app/users/operator': member,
    'kitchen_access/operator': { apps: { app: access } },
    ...overrides,
  }
  return {
    read: async (target, id) => ({
      exists: !!docs[`${target}/${id}`],
      data: docs[`${target}/${id}`],
    }),
  }
}
const actor = { uid: 'operator', runtimeAppId: 'app' }
test('Kitchen record authority accepts name-only Kitchen; Place workflows still require Place', async () => {
  assert.equal(
    (
      await authority.requireKitchenRecordMutationAuthority(
        transaction(),
        actor,
        'mine'
      )
    ).ownerAppId,
    'app'
  )
  await assert.rejects(
    authority.requireKitchenMutationAuthority(transaction(), actor, 'mine'),
    /linked Place/
  )
  assert.deepEqual(
    (
      await authority.requireKitchenMutationAuthority(
        transaction({ 'places/mine': { name: 'Place' } }),
        actor,
        'mine'
      )
    ).placeData,
    { name: 'Place' }
  )
})
test('Kitchen record authority rejects missing membership, revoked/rejoined access, wrong Kitchen and invalid subscription', async () => {
  for (const overrides of [
    { 'apps/app/users/operator': undefined },
    { 'kitchen_access/operator': undefined },
    { 'kitchen_access/operator': { apps: { app: { ...access, ids: ['other'] } } } },
    {
      'kitchen_access/operator': { apps: { app: {
        ...access,
        membership_created_at: { ...at, seconds: 99 },
      } } },
    },
    { 'apps/app/users/operator': { ...member, subscription: 'invalid' } },
    { 'kitchens/mine': undefined },
  ])
    await assert.rejects(
      authority.requireKitchenRecordMutationAuthority(
        transaction(overrides),
        actor,
        'mine'
      )
    )
  await assert.rejects(
    authority.requireKitchenRecordMutationAuthority(
      transaction(),
      { ...actor, runtimeAppId: 'other' },
      'mine'
    )
  )
})
const prep = load(
  '../runtime/kitchen/utils/recipe-preparation.ts',
  'validateRecipePreparation,normalizeRecipePreparation',
  {isFirestoreDocumentId}
)
const { normalizeTranslatedText } = load(
  '../runtime/kitchen/utils/recipe.ts',
  'normalizeTranslatedText',
  { normalizeRecipePreparation: prep.normalizeRecipePreparation }
)
const { readRecipeUpdate } = load(
  '../runtime/kitchen/utils/recipe-update-input.ts',
  'readRecipeUpdate',
  { ...prep, normalizeTranslatedText }
)
test('Recipe update accepts only supported editable fields and keeps preparation validation', () => {
  assert.deepEqual(
    readRecipeUpdate({
      name: ' Soup ',
      description: ' Hot ',
      names: { en: ' Soup ' },
    }),
    { name: 'Soup', description: 'Hot', names: { en: 'Soup' } }
  )
  for (const key of [
    'id',
    'kitchen_id',
    'slug',
    'source_language',
    'created',
    'updated',
    'unknown',
    'preparation.ingredients',
  ])
    assert.throws(
      () => readRecipeUpdate({ name: 'Soup', [key]: 'forged' }),
      /Unsupported/
    )
  for (const value of [
    null,
    [],
    {},
    { name: '' },
    { descriptions: { en: 3 } },
    {
      preparation: {
        prep_items: [
          { prep_item_id: 'other/kitchen', quantity: 1, unit: 'kg' },
        ],
      },
    },
  ])
    assert.throws(() => readRecipeUpdate(value))
})
test('trusted Recipe patch validation rejects injected scope before persisting', async () => {
  const writes = []
  const { useRecipeUpdate } = load(
    '../runtime/kitchen/composables/recipe/useRecipeUpdate.ts',
    'useRecipeUpdate',
    {
      // The current controller invokes a trusted command; validation belongs there.
      useRecipeMutation: () => ({ mutate: async (method, input) => {
        assert.equal(method, 'PATCH')
        const changes = readRecipeUpdate(input.changes)
        writes.push({ id: input.recipeId, changes })
        return { id: input.recipeId }
      } }),
    }
  )
  const api = useRecipeUpdate()
  await assert.rejects(api.updateRecipe('soup', { name: 'Soup', kitchen_id: 'other' }))
  assert.equal(writes.length, 0)
  await api.updateRecipe('soup', { name: ' Soup ' })
  assert.deepEqual(writes, [{ id: 'soup', changes: { name: 'Soup' } }])
})

test('capability directory routes Create and requires record targets for Update/Delete', async () => {
  const ids = {
    menus: ['create-menu', 'update-menu', 'delete-menu'],
    dishes: ['create-dish', 'update-dish', 'delete-dish'],
    drinks: ['create-drink', 'update-drink', 'delete-drink'],
    recipes: ['create-recipe', 'update-recipe', 'delete-recipe'],
    ingredients: ['add-ingredient', 'delete-ingredient'],
  }
  const navigations = []
  const active = { value: null }
  const { kitchenCapabilityToolDirectory, useKitchenCapabilityToolDirectory } =
    load(
      '../runtime/kitchen/composables/workspace/useKitchenCapabilityTools.ts',
      'kitchenCapabilityToolDirectory,useKitchenCapabilityToolDirectory',
      {
        kitchenCapabilityTools: Object.fromEntries(
          Object.entries(ids).map(([operation, names]) => [
            operation,
            names.map((name) => ({
              id: `kitchen.${operation}.${name}`,
              status: 'available',
            })),
          ])
        ),
        navigateTo: async (path) => navigations.push(path),
        useRoute: () => ({ path: '/workspace/kitchen/menu-setup' }),
        useState: () => active,
        useAuth: () => ({ currentUser: { value: { uid: 'operator' } } }),
        watch: () => {},
        computed: (fn) => ({
          get value() {
            return fn()
          },
        }),
        useWorkspace: () => ({ selectedId: { value: 'mine' } }),
        useKitchenMenuCollection: () => ({ menus: { value: [] } }),
      }
    )
  assert.equal(
    kitchenCapabilityToolDirectory.filter((entry) => entry.to).length,
    5
  )
  assert.equal(
    kitchenCapabilityToolDirectory.some(
      (entry) => entry.tool.id === 'kitchen.menus.delete-menu'
    ),
    false
  )
  assert.equal(
    kitchenCapabilityToolDirectory
      .filter((entry) => /update-|delete-/.test(entry.tool.id))
      .some((entry) => entry.to),
    false
  )
  const directory = useKitchenCapabilityToolDirectory()
  assert.equal(
    await directory.performAction('kitchen.recipes.create-recipe'),
    true
  )
  assert.deepEqual(navigations, ['/workspace/kitchen/prep/recipes?create=1'])
  assert.equal(active.value, null)
  assert.equal(
    await directory.performAction('kitchen.recipes.update-recipe'),
    false
  )
  assert.equal(
    await directory.performAction('kitchen.menus.delete-menu', 'anything'),
    false
  )
})
