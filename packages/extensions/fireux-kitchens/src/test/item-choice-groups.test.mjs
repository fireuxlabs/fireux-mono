import { promotionPricedItem } from '../runtime/kitchen/utils/promotions/pricing.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeItemChoiceGroups,
  readItemChoiceGroups,
  priceItemChoices,
  toggleItemChoice,
} from '../runtime/kitchen/utils/item-choices.ts'
import { normalizeDishPricingPatch } from '../runtime/kitchen/utils/dish-pricing.ts'
import { serviceBasketLine } from '../runtime/menu/utils/ordering/basket.ts'
import { serviceSelections } from '../runtime/menu/utils/ordering/checkout.ts'
import { readMenuOrderSelections } from '../runtime/menu/server/ordering/selections.ts'
const option = (id, price = 0) => ({ id, label: id, price })
const group = (id, min, max, pricing = 'additional') => ({
  id,
  name: id,
  min,
  max,
  pricing,
  options: [option('a', 1), option('b', 2), option('c', 3)],
})
const groups = () => [
  group('size', 1, 1, 'full'),
  group('sauce', 0, 1),
  group('extras', 0, null),
  group('sides', 2, 2),
]
const selections = () => ({ size: ['b'], sides: ['a', 'c'] })
test('selection limits and replacement versus additional prices share one exact calculation', () => {
  const values = normalizeItemChoiceGroups(groups())
  assert.equal(priceItemChoices(99, values, selections()).unitMinor, 600)
  assert.equal(
    priceItemChoices(99, values, {
      ...selections(),
      sauce: ['b'],
      extras: ['a', 'c'],
    }).unitMinor,
    1200
  )
  const optional = toggleItemChoice(values, selections(), 'sauce', 'a')
  assert.deepEqual(toggleItemChoice(values, optional, 'sauce', 'b').sauce, [
    'b',
  ])
  assert.deepEqual(toggleItemChoice(values, optional, 'sauce', 'a').sauce, [])
  assert.deepEqual(toggleItemChoice(values, selections(), 'size', 'b').size, [
    'b',
  ])
})
test('invalid definitions and forged or incomplete selections cannot be priced', () => {
  for (const mutate of [
    (x) => (x[0].min = 0),
    (x) => x.push(group('other', 1, 1, 'full')),
    (x) => (x[1].max = 0),
    (x) => (x[1].options[0].price = -1),
    (x) => (x[1].options[0].price = 1.001),
    (x) => (x[1].options[1].id = 'a'),
    (x) => (x[1].id = '__proto__'),
  ]) {
    const values = groups()
    mutate(values)
    assert.throws(() => normalizeItemChoiceGroups(values))
  }
  const values = normalizeItemChoiceGroups(groups())
  for (const selection of [
    {},
    { ...selections(), size: [] },
    { ...selections(), size: ['a', 'b'] },
    { ...selections(), sauce: ['a', 'b'] },
    { ...selections(), extras: ['a', 'a'] },
    { ...selections(), extras: ['gone'] },
    { ...selections(), unknown: ['a'] },
  ])
    assert.throws(() => priceItemChoices(99, values, selection))
  assert.equal(priceItemChoices(99, values, {}, true).unitMinor, 9900)
})
test('historical flat records project without writes; explicit groups win and identifiers survive renaming', () => {
  const old = {
    price_options: [{ label: 'Large', price: 18 }],
    add_ons: [{ id: 'cheese', label: 'Cheese', price: 2 }],
  }
  const before = structuredClone(old),
    projected = readItemChoiceGroups(old)
  assert.equal(projected[0].pricing, 'full')
  assert.equal(projected[1].min, 0)
  assert.deepEqual(old, before)
  assert.deepEqual(readItemChoiceGroups({ ...old, choice_groups: [] }), [])
  const explicit = groups()
  explicit[0].name = 'Portions'
  explicit[0].options[1].label = 'Medium'
  assert.equal(normalizeItemChoiceGroups(explicit)[0].options[1].id, 'b')
  const patch = normalizeDishPricingPatch({
    price: 0,
    choice_groups: explicit,
    price_options: [],
    add_ons: [],
  })
  assert.equal(patch.price, 1)
  assert.equal(patch.choice_groups[0].name, 'Portions')
})
test('basket selections round-trip group IDs and reject old flat choices for a grouped Item', () => {
  const offer = {
    source: { kitchenId: 'k', menuId: 'm', sectionId: 's' },
    presentation: { currencyCode: 'CHF' },
    offerings: [],
    item: {
      id: 'i',
      name: 'Item',
      price: 99,
      priceOptions: [],
      addOns: [],
      choiceGroups: groups(),
    },
  }
  const choices = {
    quantity: 1,
    optionId: '',
    extraIds: [],
    groups: {},
    choiceGroups: selections(),
  }
  const line = serviceBasketLine(offer, choices)
  assert.equal(line.unitMinor, 600)
  const parsed = readMenuOrderSelections(serviceSelections([line]))
  assert.deepEqual(parsed[0].choiceGroups, line.choices.choiceGroups)
  choices.choiceGroups.size.push('a')
  assert.deepEqual(line.choices.choiceGroups.size, ['b'])
  assert.throws(() =>
    serviceBasketLine(offer, {
      ...choices,
      choiceGroups: selections(),
      optionId: 'b',
    })
  )
  assert.throws(() =>
    readMenuOrderSelections([
      {
        sectionId: 's',
        itemId: 'i',
        quantity: 1,
        choiceGroups: { size: ['a', 'a'] },
      },
    ])
  )
})

test('promotions replace full choice prices and retain additional charges', () => {
  const values = groups()
  const item = {
    id: 'i',
    dishId: 'dish',
    name: 'Item',
    price: 1,
    priceOptions: [],
    addOns: [],
    choiceGroups: values,
  }
  const result = promotionPricedItem(
    item,
    [
      {
        id: 'offer',
        name: 'Offer',
        status: 'active',
        currency: 'CHF',
        days: ['monday'],
        dishes: [{ dishId: 'dish', price: 10 }],
      },
    ],
    'monday'
  ).item
  assert.equal(result.choiceGroups[0].options[0].price, 10)
  assert.equal(result.choiceGroups[1].options[0].price, 1)
  assert.equal(
    priceItemChoices(result.price, result.choiceGroups, selections()).unitMinor,
    1400
  )
  assert.equal(item.choiceGroups[0].options[0].price, 1)
})
