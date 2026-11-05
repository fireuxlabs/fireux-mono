import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL('../runtime/menu/server/draft/plan.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const planKitchenMenuDraft = compileFunction(
  `${stripTypeScriptTypes(source)}; return planKitchenMenuDraft`,
  [
    'createHash',
    'normalizeSlug',
    'normalizeDishAddOns',
    'normalizeDishPriceOptions',
    'appendKitchenMenuCacheUnits',
  ]
)(
  createHash,
  (value) => String(value).trim().toLowerCase().replace(/\s+/g, '-'),
  (value) => value,
  (value) => value,
  (units, unit) => units.push(unit)
)
const item = {
  name: 'Soup',
  description: '',
  item_kind: 'food',
  image_url: 'https://example.com/unreviewed.jpg',
  price: 0,
  price_options: [
    { label: 'Small', price: 5 },
    { label: 'Large', price: 8 },
  ],
  add_ons: [],
  name_translations: [{ language: 'de', text: 'Suppe' }],
  description_translations: [],
}
const section = { label: 'Lunch', label_translations: [], items: [item, item] }
const stamp = { by: 'operator', at: 'unchanged' }

test('draft planner preserves distinct identities, prices, stamps and Dish ownership', () => {
  const { plannedSections } = planKitchenMenuDraft(
    { kitchenId: 'k', menuId: 'm', sections: [section, section] },
    stamp
  )
  assert.deepEqual(
    plannedSections.map((row) => row.sectionId),
    ['lunch', 'lunch-2']
  )
  const items = plannedSections.flatMap((row) => row.items)
  assert.equal(new Set(items.map((row) => row.dishId)).size, 4)
  for (const row of items) {
    assert.equal(row.dishData.price, 5)
    assert.equal(Object.hasOwn(row.itemData, 'price'), false)
    assert.equal(row.itemData.dish_id, row.dishId)
    assert.equal(row.dishData.item_kind, 'food')
    assert.equal(row.itemData.created, stamp)
    assert.equal(row.dishData.updated, stamp)
    assert.equal(Object.hasOwn(row.itemData, 'name'), false)
    assert.equal(Object.hasOwn(row.itemData, 'image_url'), false)
    assert.equal(Object.hasOwn(row.dishData, 'image_url'), false)
  }
})

test('translation planning uses the same section and item identities as the writes', () => {
  const { plannedSections, sproochliCacheUnits } = planKitchenMenuDraft(
    { kitchenId: 'k', menuId: 'm', sections: [section] },
    stamp
  )
  const row = plannedSections[0]
  const unit = sproochliCacheUnits.find(
    (unit) =>
      unit.fieldId === `dish:${row.sectionId}__${row.items[0].itemId}:name`
  )
  assert.deepEqual(unit.translations, item.name_translations)
  assert.equal(unit.sourceText, 'Soup')
})

test('content replacement removes stale children and preserves create/update decisions inside the supplied transaction', () => {
  const contentSource = readFileSync(
    new URL('../runtime/menu/server/draft/replace-content.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const replace = compileFunction(
    `${stripTypeScriptTypes(contentSource)}; return replaceKitchenMenuDraftContent`,
    [
      'serverKitchenDishesTarget',
      'serverKitchenMenuItemsTarget',
      'serverKitchenMenuSectionsTarget',
    ]
  )(
    (k) => `kitchens/${k}/dishes`,
    (k, m, s) => `kitchens/${k}/menus/${m}/sections/${s}/items`,
    (k, m) => `kitchens/${k}/menus/${m}/sections`
  )
  const { plannedSections } = planKitchenMenuDraft(
    { kitchenId: 'k', menuId: 'm', sections: [section, section] },
    stamp
  )
  const first = plannedSections[0].items[0]
  const calls = []
  const mutations = Object.fromEntries(
    ['create', 'update', 'delete'].map((verb) => [
      verb,
      (target, id) => calls.push([verb, target, id]),
    ])
  )
  replace(mutations, {
    kitchenId: 'k',
    menuId: 'm',
    plannedSections,
    oldItems: new Map([
      ['removed-section', new Set(['removed-item'])],
      ['lunch', new Set([first.itemId, 'stale-item'])],
    ]),
    existingDishIds: new Set([first.dishId]),
  })
  for (const expected of [
    [
      'delete',
      'kitchens/k/menus/m/sections/removed-section/items',
      'removed-item',
    ],
    ['delete', 'kitchens/k/menus/m/sections', 'removed-section'],
    ['delete', 'kitchens/k/menus/m/sections/lunch/items', 'stale-item'],
    ['update', 'kitchens/k/menus/m/sections', 'lunch'],
    ['create', 'kitchens/k/menus/m/sections', 'lunch-2'],
    ['update', 'kitchens/k/menus/m/sections/lunch/items', first.itemId],
    ['update', 'kitchens/k/dishes', first.dishId],
    ['create', 'kitchens/k/dishes', plannedSections[1].items[0].dishId],
  ])
    assert.ok(
      calls.some((call) => JSON.stringify(call) === JSON.stringify(expected)),
      JSON.stringify(expected)
    )
  assert.equal(calls.filter((call) => call[0] === 'delete').length, 3)
})

test('separate imports never infer Dish identity from a shared name, while retries keep their identities', () => {
  const plan = (menuId) =>
    planKitchenMenuDraft({ kitchenId: 'k', menuId, sections: [section] }, stamp)
      .plannedSections[0].items
  const first = plan('first-upload')
  const second = plan('second-upload')
  assert.notEqual(first[0].dishId, 'soup')
  assert.notEqual(first[0].dishId, second[0].dishId)
  assert.deepEqual(
    first.map((row) => row.dishId),
    plan('first-upload').map((row) => row.dishId)
  )
  assert.notEqual(first[0].dishId, first[1].dishId)
})
