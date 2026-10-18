import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

function load(path, names, context = {}) {
  const source = readFileSync(
    new URL('../runtime/' + path + '.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + `; return {${names}}`,
    Object.keys(context)
  )(...Object.values(context))
}
const policy = load(
  'menu/utils/service-basket',
  'serviceBasketLine,serviceItemSignature'
)
const { useServiceBasket } = load(
  'menu/composables/useServiceBasket',
  'useServiceBasket',
  { computed, ref, toValue, ...policy }
)
const offer = (menuId = 'food', changes = {}) => ({
  source: { kitchenId: 'venue', menuId, sectionId: 'section' },
  presentation: { currencyCode: 'CHF' },
  offerings: [{ id: 'collection' }],
  label: 'Food',
  item: {
    id: 'item',
    dishId: 'dish',
    name: 'Pizza',
    price: 13,
    priceOptions: [],
    addOns: [],
    ...changes,
  },
})
const choices = (changes = {}) => ({
  optionId: '',
  extraIds: [],
  groups: {},
  quantity: 1,
  ...changes,
})

test('one basket holds Food and Drinks with complete source identity and exact totals', () => {
  const food = offer(),
    drink = offer('drinks', { name: 'Cola', price: 4 })
  const basket = useServiceBasket([food, drink])
  basket.add(food, choices({ quantity: 2 }))
  basket.add(drink, choices())
  assert.equal(basket.count.value, 3)
  assert.equal(basket.totalMinor.value, 3000)
  assert.deepEqual(
    basket.lines.value.map((line) => line.source.menuId),
    ['food', 'drinks']
  )
  assert.equal(basket.lines.value[0].source.sectionId, 'section')
  assert.equal(basket.lines.value[0].itemId, 'item')
  assert.deepEqual(basket.lines.value[0].offeringIds, ['collection'])
})
test('options replace the base price and selected extras add once, without modifying catalogue prices', () => {
  const item = offer('food', {
    priceOptions: [{ id: 'large', label: 'Large', price: 15.25 }],
    addOns: [{ id: 'cheese', label: 'Cheese', price: 1.5 }],
  })
  const before = structuredClone(item)
  assert.throws(() => policy.serviceBasketLine(item, choices()), /option/)
  const line = policy.serviceBasketLine(
    item,
    choices({ optionId: 'large', extraIds: ['cheese', 'cheese'], quantity: 2 })
  )
  assert.equal(line.unitMinor, 1675)
  assert.deepEqual(line.details, ['Large', 'Cheese'])
  assert.deepEqual(item, before)
  assert.throws(
    () =>
      policy.serviceBasketLine(
        item,
        choices({ optionId: 'large', extraIds: ['missing'] })
      ),
    /extra/
  )
})
test('identical choices merge, different choices stay separate and removal recalculates totals', () => {
  const item = offer('food', {
    addOns: [{ id: 'cheese', label: 'Cheese', price: 1 }],
  })
  const basket = useServiceBasket([item])
  basket.add(item, choices())
  basket.add(item, choices())
  basket.add(item, choices({ extraIds: ['cheese'] }))
  assert.equal(basket.lines.value.length, 2)
  assert.equal(basket.totalMinor.value, 4000)
  basket.adjust(basket.lines.value[0].key, -1)
  assert.equal(basket.totalMinor.value, 2700)
  basket.remove(basket.lines.value[1].key)
  basket.adjust(basket.lines.value[0].key, -1)
  assert.equal(basket.count.value, 0)
})
test('stale catalogue entries are flagged without silently changing basket prices', () => {
  const original = offer(),
    current = ref([original])
  const basket = useServiceBasket(current)
  basket.add(original, choices())
  current.value = [offer('food', { price: 14 })]
  assert.equal(basket.staleKeys.value.length, 1)
  assert.equal(basket.totalMinor.value, 1300)
  assert.throws(() => basket.add(original, choices()), /changed/)
  current.value = []
  assert.equal(basket.staleKeys.value.length, 1)
})
test('meal deal choices and supplements are required and free items remain valid', () => {
  const deal = offer('food', {
    price: 15,
    mealDeal: {
      groups: [
        {
          id: 'main',
          name: 'Main',
          choose: 1,
          dishes: [{ dishId: 'pizza', name: 'Pizza', supplement: 2 }],
        },
      ],
    },
  })
  assert.throws(() => policy.serviceBasketLine(deal, choices()), /Choose 1/)
  assert.equal(
    policy.serviceBasketLine(deal, choices({ groups: { main: ['pizza'] } }))
      .unitMinor,
    1700
  )
  assert.equal(
    policy.serviceBasketLine(offer('food', { price: 0 }), choices()).unitMinor,
    0
  )
})
test('quantity bounds, incompatible currencies and separate basket instances are respected', () => {
  const item = offer(),
    basket = useServiceBasket([item])
  assert.throws(() => basket.add(item, choices({ quantity: 0 })), /quantity/)
  assert.throws(() => basket.add(item, choices({ quantity: 1.5 })), /quantity/)
  basket.add(item, choices({ quantity: 99 }))
  assert.throws(() => basket.add(item, choices()), /99/)
  assert.equal(useServiceBasket([item]).lines.value.length, 0)
  const other = { ...offer('drinks'), presentation: { currencyCode: 'EUR' } }
  const mixed = useServiceBasket([item, other])
  mixed.add(item, choices())
  assert.throws(() => mixed.add(other, choices()), /currencies/)
})
