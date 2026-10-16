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
  'normalizePromotionPrice,promotionDay,promotionDays,promotionPricedItem,promotionPricedSections'
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
  label: 'Sunday pizzas',
  currency: 'CHF',
  amount_minor: 1100,
  days: ['sunday'],
  section_ids: ['pizza'],
})
const publicRule = () => [
  {
    ...rule(),
    id: 'sunday-pizzas',
    name: 'Sunday pizzas',
    kind: 'fixed_price',
    status: 'active',
    menu_id: 'food',
    timezone: 'Europe/Zurich',
  },
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
test('pricing writer normalizes detached rule and rejects invalid amounts and scope', () => {
  const input = rule(),
    normalized = pricing.normalizePromotionPrice(input)
  input.days.push('monday')
  input.section_ids.push('snacks')
  assert.deepEqual(normalized.days, ['sunday'])
  assert.deepEqual(normalized.section_ids, ['pizza'])
  assert.equal(pricing.normalizePromotionPrice(null), null)
  for (const patch of [
    { amount_minor: 11.5 },
    { amount_minor: -1 },
    { amount_minor: 0 },
    { currency: 'chf' },
    { days: [] },
    { days: ['sunday', 'sunday'] },
    { days: ['holiday'] },
    { section_ids: ['../pizza'] },
    { unexpected: true },
  ])
    assert.throws(() =>
      pricing.normalizePromotionPrice({ ...rule(), ...patch })
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
test('Sunday promotion applies to required variants, leaves extras and other sections alone', () => {
  const original = item()
  const priced = pricing.promotionPricedItem(
    original,
    'pizza',
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
    pricing.promotionPricedItem(original, 'snacks', publicRule(), 'sunday').item
      .price,
    13
  )
  assert.equal(
    pricing.promotionPricedItem(original, 'pizza', publicRule(), 'monday').item
      .price,
    13
  )
  assert.equal(
    pricing.promotionPricedItem(
      original,
      'snacks',
      publicRule().map((rule) => ({ ...rule, section_ids: [] })),
      'sunday'
    ).item.price,
    11
  )
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
