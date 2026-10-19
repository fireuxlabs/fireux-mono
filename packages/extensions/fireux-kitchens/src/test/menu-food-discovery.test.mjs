import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
const source = readFileSync(
  new URL('../runtime/menu/components/Collection/Results.vue', import.meta.url),
  'utf8'
)
test('Menu discovery retains each menu, filters services and preserves destination intent without a Kitchen read', () => {
  const rows = [
    {
      id: 'food',
      name: 'Pizza',
      contexts: ['collection', 'delivery'],
      source: { kitchen_slug: 'baren' },
      offerings: [{ id: 'pickup' }, { id: 'courier' }, { id: 'tables' }],
      offering_options: [
        { kitchen_offering_id: 'pickup', type: 'collection' },
        { kitchen_offering_id: 'courier', type: 'delivery' },
        { kitchen_offering_id: 'tables', type: 'dine_in' },
      ],
    },
    {
      id: 'breakfast',
      name: 'Breakfast',
      contexts: [],
      source: { kitchen_slug: 'baren' },
      offering_options: [{ type: 'dine_in' }],
    },
    {
      id: 'paused',
      name: 'Paused',
      source: { kitchen_slug: 'elsewhere' },
      offering_options: [{ type: 'collection', paused: true }],
    },
  ]
  rows[0].offerings.push({
    id: 'picnic',
    separate: true,
    collection_timing: 'next_day',
  })
  rows[0].offering_options.push({
    kitchen_offering_id: 'picnic',
    type: 'collection',
  })
  const script = readFileSync(
    new URL('../runtime/menu/utils/food-venue-groups.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const deps = {
    directoryMenuRouteScope: (kitchenSlug) => ({
      kind: 'directory',
      kitchenSlug,
    }),
    rootMenuRouteScope: () => ({ kind: 'root' }),
    menuRouteIndexPath: (scope, service) =>
      `/kitchens/${scope.kitchenSlug}/menu.${service}`,
    menuRoutePath: ({ scope, menuId }) =>
      `/kitchens/${scope.kitchenSlug}/menus/${menuId}`,
  }
  const group = compileFunction(
    `${stripTypeScriptTypes(script)}; return foodVenueGroups`,
    Object.keys(deps)
  )(...Object.values(deps))
  const before = structuredClone(rows)
  const groups = group(rows)
  assert.equal(groups.length, 1)
  assert.equal(groups[0].title, 'Pizza')
  assert.equal(groups[0].actions.length, 2)
  assert.deepEqual(groups[0].actions[0].offerings, [{ id: 'pickup' }])
  assert.deepEqual(groups[0].actions[1].offerings, [{ id: 'courier' }])
  assert.equal(groups[0].actions[0].to, '/kitchens/baren/menu.collection')
  assert.equal(group(rows, 'collection')[0].actions.length, 1)
  assert.deepEqual(group(rows, 'collection')[0].actions[0].offerings, [
    { id: 'pickup' },
  ])
  assert.equal(
    group(rows, 'delivery')[0].actions[0].to,
    '/kitchens/baren/menu.delivery'
  )
  assert.deepEqual(group(rows, 'delivery')[0].actions[0].offerings, [
    { id: 'courier' },
  ])
  assert.deepEqual(rows, before)
  rows[0].matching_dishes = [
    { id: 'pizza', name: 'Pizza Margherita' },
    { id: 'pizza', name: 'Pizza Margherita' },
  ]
  const drinks = {
    ...structuredClone(rows[0]),
    id: 'drinks',
    name: 'Drinks',
    matching_dishes: [],
  }
  assert.equal(
    group([...rows, drinks], 'collection')[0].matchingDishes.length,
    1
  )
  assert.equal(group([...rows, drinks])[0].title, 'Pizza & Drinks')
  assert.deepEqual(group([{ ...rows[0], source: {} }]), [])
  assert.equal(
    group(rows, 'collection')[0].actions[0].offerings.some(
      (row) => row.id === 'picnic'
    ),
    false
  )
  assert.doesNotMatch(source, /useKitchenCollection|MenuCollectionList/)
})
