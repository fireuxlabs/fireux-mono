import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(path, names, deps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + `; return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const pricing = load(
  '../runtime/kitchen/utils/promotions/pricing.ts',
  'normalizeKitchenPromotion,promotionDay,promotionDays,promotionPricedItem,promotionPricedSections'
)
const hours = load(
  '../../../fireux-places/src/runtime/place/utils/opening-hours-status.ts',
  'readOpeningHoursStatus'
)
const { serviceSections } = load(
  '../runtime/menu/utils/service-sections.ts',
  'serviceSections',
  { ...pricing, ...hours }
)
const rule = () => ({
  name: 'Sunday pizzas',
  status: 'active',
  currency: 'CHF',
  days: ['sunday'],
  dishes: [{ dishId: 'margherita', price: 11 }],
})
const publicRule = () => [
  { ...rule(), id: 'sunday-pizzas', timezone: 'Europe/Zurich' },
]
const item = () => ({
  id: 'placement',
  dishId: 'margherita',
  name: 'Margherita',
  description: '',
  imageUrl: '',
  price: 13,
  priceLabel: '13',
  priceOptions: [
    { id: 'regular', label: 'Regular', price: 13, priceLabel: '13' },
    { id: 'large', label: 'Large', price: 18, priceLabel: '18' },
  ],
  addOns: [{ id: 'cheese', label: 'Cheese', price: 2, priceLabel: '2' }],
})
const section = () => ({ id: 'pizza', label: 'Pizza', items: [item()] })
const sunday = new Date('2026-10-18T10:00:00Z')
function source(
  menuId,
  offeringDays = ['friday', 'saturday', 'sunday', 'monday'],
  promotion = publicRule()
) {
  return {
    manifest: {
      content: {
        id: menuId,
        name: menuId,
        sections: [section()],
        ...(promotion ? { promotions: promotion } : {}),
      },
      source: { menuId, kitchenId: 'k' },
      presentation: { currencyCode: 'CHF' },
    },
    offerings: [
      {
        id: menuId,
        name: menuId,
        paused: false,
        hours: {
          timezone: 'Europe/Zurich',
          windows: [{ days: offeringDays, open: '16:00', close: '23:00' }],
        },
      },
    ],
  }
}
test('promotion normalizes detached dish prices and rejects malformed entries', () => {
  const input = rule(),
    normalized = pricing.normalizeKitchenPromotion(input)
  input.dishes[0].price = 99
  input.days.push('monday')
  assert.equal(normalized.dishes[0].price, 11)
  assert.deepEqual(normalized.days, ['sunday'])
  for (const patch of [
    { dishes: [] },
    { dishes: [{ dishId: 'x', price: 11.111 }] },
    { dishes: [{ dishId: 'x', price: -1 }] },
    { dishes: [{ dishId: 'x', price: Infinity }] },
    { dishes: [{ dishId: 'x', price: '11' }] },
    {
      dishes: [
        { dishId: 'x', price: 1 },
        { dishId: 'x', price: 2 },
      ],
    },
    { currency: 'chf' },
    { days: [] },
    { days: ['sunday', 'sunday'] },
    { menu_id: 'food' },
  ])
    assert.throws(() =>
      pricing.normalizeKitchenPromotion({ ...rule(), ...patch })
    )
  assert.equal(
    pricing.normalizeKitchenPromotion({
      ...rule(),
      dishes: [{ dishId: 'x', price: 11.5 }],
    }).dishes[0].price,
    11.5
  )
  assert.equal(
    pricing.normalizeKitchenPromotion({
      ...rule(),
      dishes: [{ dishId: 'x', price: 0 }],
    }).dishes[0].price,
    0
  )
})
test('Sunday local midnight and Monday expiry leave normal prices unchanged', () => {
  const original = [section()],
    before = structuredClone(original)
  for (const [stamp, expected] of [
    ['2026-10-17T21:59:00Z', 13],
    ['2026-10-17T22:00:00Z', 11],
    ['2026-10-18T21:59:00Z', 11],
    ['2026-10-18T22:00:00Z', 13],
  ]) {
    assert.equal(
      pricing.promotionPricedSections(
        original,
        publicRule(),
        new Date(stamp)
      )[0].items[0].price,
      expected
    )
  }
  assert.deepEqual(original, before)
})
test('dish promotion applies across placements, keeps extras and unselected dishes unchanged', () => {
  const original = item()
  const priced = pricing.promotionPricedItem(
    original,
    publicRule(),
    'sunday'
  ).item
  assert.equal(priced.price, 11)
  assert.deepEqual(
    priced.priceOptions.map((row) => row.price),
    [11, 11]
  )
  assert.equal(priced.addOns[0].price, 2)
  assert.equal(original.price, 13)
  assert.equal(
    pricing.promotionPricedItem(
      { ...original, dishId: 'salad' },
      publicRule(),
      'sunday'
    ).item.price,
    13
  )
  assert.equal(
    pricing.promotionPricedItem(original, publicRule(), 'monday').item.price,
    13
  )
  const sections = pricing.promotionPricedSections(
    [{ id: 'other-menu-section', label: 'Other', items: [original] }],
    publicRule(),
    sunday
  )
  assert.equal(sections[0].items[0].price, 11)
})
test('Sunday daylight-saving transition retains venue-local pricing', () => {
  for (const stamp of ['2026-10-25T00:30:00Z', '2026-10-25T01:30:00Z'])
    assert.equal(
      pricing.promotionPricedSections(
        [section()],
        publicRule(),
        new Date(stamp)
      )[0].items[0].price,
      11
    )
})
test('next Sunday serving shows Sunday price; next Monday serving shows normal price', () => {
  const nextSunday = serviceSections(
    [source('Sunday', ['sunday'])],
    new Date('2026-10-17T20:00:00Z')
  )
  assert.equal(nextSunday[0].items[0].item.price, 11)
  const nextMonday = serviceSections(
    [source('Monday', ['monday'])],
    new Date('2026-10-18T21:30:00Z')
  )
  assert.equal(nextMonday[0].items[0].item.price, 13)
})
test('current service beats a future promotion; active promotion beats current normal offer', () => {
  const friday = new Date('2026-10-16T16:00:00Z')
  const normal = source('normal', ['friday', 'sunday'], null),
    special = source('special', ['sunday'])
  assert.equal(
    serviceSections([special, normal], friday)[0].items[0].item.price,
    13
  )
  for (const sources of [
    [normal, special],
    [special, normal],
  ]) {
    const rows = serviceSections(sources, new Date('2026-10-18T16:00:00Z'))[0]
      .items
    assert.equal(rows.length, 1)
    assert.equal(rows[0].item.price, 11)
    assert.equal(rows[0].alternatives[0].item.price, 13)
    assert.deepEqual(
      rows[0].offerings.map((row) => row.id),
      ['special']
    )
  }
})
test('conflicting normal offers survive deduplication and are stable under source reorder', () => {
  const a = source('a', ['sunday'], null),
    b = source('b', ['sunday'], null)
  b.manifest.content.sections[0].items[0].price = 16
  for (const sources of [
    [a, b],
    [b, a],
  ]) {
    const rows = serviceSections(sources, sunday)[0].items
    assert.equal(rows.length, 1)
    assert.equal(rows[0].item.price, 13)
    assert.equal(rows[0].alternatives[0].item.price, 16)
  }
})

test('each promotional dish keeps its own decimal price without changing catalogue terms', () => {
  const dishes = [
    { ...item(), dishId: 'margherita' },
    { ...item(), dishId: 'salad' },
  ]
  const promotion = [
    {
      ...publicRule()[0],
      dishes: [
        { dishId: 'margherita', price: 11 },
        { dishId: 'salad', price: 4.5 },
      ],
    },
  ]
  const result = pricing.promotionPricedSections(
    [{ id: 'mixed', label: 'Mixed', items: dishes }],
    promotion,
    sunday
  )
  assert.deepEqual(
    result[0].items.map((dish) => dish.price),
    [11, 4.5]
  )
  assert.deepEqual(
    dishes.map((dish) => dish.price),
    [13, 13]
  )
  assert(result[0].items.every((dish) => dish.addOns[0].price === 2))
})

const bundleItem = () => ({
  ...item(),
  id: 'meal-placement',
  dishId: '',
  name: 'Pizza meal',
  price: 15,
  priceOptions: [],
  addOns: [],
  mealDeal: {
    promotionId: 'meal',
    timezone: 'Europe/Zurich',
    days: ['sunday'],
    groups: [
      {
        id: 'pizza',
        name: 'Pizza',
        choose: 1,
        dishes: [
          { dishId: 'margherita', name: 'Margherita', supplement: 0 },
          { dishId: 'swiss', name: 'Swiss', supplement: 3 },
        ],
      },
    ],
  },
})
test('meal deals keep set prices and filter by the venue-local serving day', () => {
  const bundle = bundleItem()
  assert.equal(
    pricing.promotionPricedItem(bundle, publicRule(), 'sunday').item.price,
    15
  )
  assert.equal(
    pricing.promotionPricedSections(
      [{ id: 'deals', label: 'Deals', items: [bundle] }],
      [],
      sunday
    )[0].items.length,
    1
  )
  assert.equal(
    pricing.promotionPricedSections(
      [{ id: 'deals', label: 'Deals', items: [bundle] }],
      [],
      new Date('2026-10-19T10:00:00Z')
    ).length,
    0
  )
  const a = source('food')
  a.manifest.content.sections = [
    { id: 'deals', label: 'Deals', items: [bundle] },
  ]
  const b = source('other')
  b.manifest.content.sections = structuredClone(a.manifest.content.sections)
  const rows = serviceSections([a, b], sunday)
  assert.equal(rows[0].items.length, 1)
  assert.equal(rows[0].items[0].item.price, 15)
  assert.equal(rows[0].items[0].item.mealDeal.groups[0].dishes[1].supplement, 3)
})

test('next-day collection uses the next local collection day while ordinary service prices stay unchanged', () => {
  const picnic = source('picnic')
  picnic.offerings[0].collection_timing = 'next_day'
  const saturday = new Date('2026-10-17T20:00:00Z')
  assert.equal(serviceSections([picnic], saturday)[0].items[0].item.price, 11)
  const ordinary = source('ordinary')
  assert.equal(serviceSections([ordinary], saturday)[0].items[0].item.price, 13)
  assert.equal(ordinary.manifest.content.sections[0].items[0].price, 13)
  const sundayNight = new Date('2026-10-18T20:00:00Z')
  assert.equal(
    serviceSections([picnic], sundayNight)[0].items[0].item.price,
    13
  )
})
