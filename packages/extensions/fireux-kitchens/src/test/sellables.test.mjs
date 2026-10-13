import { isFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { planSellableAdoption } from '../../../../../tools/misebox-migrations/sellables-plan.mjs'

function load(path, names, deps = {}) {
  const source = readFileSync(
    new URL(`../runtime/${path}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type (?:\*[^\n]*|\{[\s\S]*?\} from [^\n]*)\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const error = (x) => Object.assign(new Error(x.statusMessage), x)
const utils = load(
  'kitchen/utils/sellable',
  'readKitchenSellable,readSellableForm,readSellableTerms,projectSellable,sellableFulfilment'
)
const normalizers = load(
  'menu/utils/menu-item',
  'normalizeMenuItemPriceOptions,normalizeMenuItemAddOns'
)
const { normalizeMenuItemPatch } = load(
  'menu/utils/menu-item-patch',
  'normalizeMenuItemPatch',
  {
    ...normalizers,
    normalizeSlug: (v) =>
      String(v)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
  }
)
const { legacyPlacementSellable } = load(
  'kitchen/server/sellables/legacy',
  'legacyPlacementSellable',
  { ...utils, normalizeMenuItemPatch }
)
const legacy = { dish_id: 'coke', price: 4, price_options: [], add_ons: [] }
const simple = () =>
  legacyPlacementSellable(legacy, 'CHF', (i) => `stable-${i}`)

test('simple item gets an implicit stable default without a size picker', () => {
  const record = simple(),
    projected = utils.projectSellable('offer', record, 'coke')
  assert.equal(record.variants[0].id, 'stable-0')
  assert.equal(projected.price, 4)
  assert.deepEqual(projected.priceOptions, [])
  assert.equal(projected.sellable_variants[0].id, 'stable-0')
})
test('legacy prices, sizes and add-ons survive explicit adoption', () => {
  const record = legacyPlacementSellable(
    {
      ...legacy,
      price: 3,
      price_options: [
        { label: '330 ml', quantity: 330, unit: 'ml', price: 4 },
        { label: '500 ml', quantity: 500, unit: 'ml', price: 6 },
      ],
      add_ons: [{ id: 'ice', label: 'Ice', price: 0 }],
    },
    'CHF',
    (i) => `v-${i}`
  )
  assert.deepEqual(record.terms.prices, { 'v-0': 4, 'v-1': 6 })
  assert.equal(record.terms.add_ons[0].price, 0)
  const a = utils.projectSellable('shared', record, 'coke'),
    b = utils.projectSellable('shared', record, 'coke')
  assert.deepEqual(a, b)
  assert.deepEqual(
    a.priceOptions.map((v) => v.id),
    ['v-0', 'v-1']
  )
})
test('wrong Dish, archived record, malformed and incomplete terms fail closed', () => {
  assert.throws(
    () => utils.projectSellable('x', simple(), 'pizza'),
    /another Dish/
  )
  assert.throws(
    () =>
      utils.projectSellable('x', { ...simple(), status: 'archived' }, 'coke'),
    /unavailable/
  )
  for (const prices of [{}, { 'stable-0': -1 }, { 'stable-0': 4, other: 5 }])
    assert.throws(
      () =>
        utils.readKitchenSellable({
          ...simple(),
          terms: { ...simple().terms, prices },
        }),
      /Invalid/
    )
})
const db = {
  doc: () => ({
    get: async () => ({ exists: true, data: () => ({ status: 'published' }) }),
  }),
}
const request = (variant) => ({
  context: {
    kitchenId: 'k',
    menuId: 'food',
    appId: 'app',
    currencyCode: 'CHF',
  },
  kitchenOfferingId: 'service',
  orderType: 'collection',
  requestedItems: [
    { itemId: 'item', menuId: '', quantity: 2, addOns: [], variant },
  ],
})
const row = () => ({
  id: 'item',
  dish_id: 'coke',
  name: 'Coke',
  item_kind: 'drink',
  ...utils.projectSellable('shared', simple(), 'coke'),
})
test('offline mapping is stable, never merges identical placements, and recognizes adoption', () => {
  const placement = (id) => ({
    path: `kitchens/k/menus/food/sections/drinks/items/${id}`,
    data: legacy,
    updateTime: 'version',
  })
  const input = { kitchenId: 'k', placements: [placement('a'), placement('b')] }
  const plan = planSellableAdoption(input)
  assert.deepEqual(plan, planSellableAdoption(input))
  assert.notEqual(plan[0].sellableId, plan[1].sellableId)
  assert.equal(
    planSellableAdoption({
      kitchenId: 'k',
      placements: [
        { ...placement('a'), data: { ...legacy, sellable_id: 'saved' } },
      ],
    })[0].action,
    'already-bound'
  )
  assert.throws(
    () =>
      planSellableAdoption({
        kitchenId: 'wrong',
        placements: input.placements,
      }),
    /Invalid/
  )
})

function commandHarness() {
  const records = new Map([
    ['menus/food', {}],
    ['sections/drinks', {}],
    ['items/item', legacy],
    ['dishes/coke', { kitchen_id: 'k' }],
  ])
  let allowed = true
  const tx = {
    read: async (target, id) => ({
      exists: records.has(`${target}/${id}`),
      data: structuredClone(records.get(`${target}/${id}`)),
    }),
    create: (target, id, data) => {
      assert(!records.has(`${target}/${id}`))
      records.set(`${target}/${id}`, structuredClone(data))
    },
    update: (target, id, data) =>
      records.set(`${target}/${id}`, {
        ...records.get(`${target}/${id}`),
        ...structuredClone(data),
      }),
  }
  const dependencies = {
    serverAuditStamp: () => ({ by: 'cook', at: 'now' }),
    randomUUID: () => 'new-offer',
    createError: error,
    requireFirestoreDocumentId: (v) => {
      if (typeof v !== 'string' || !v || v.includes('/'))
        throw Error('Invalid id')
      return v
    },
    runGuardedServerTransaction: async (_, fn) => fn(tx),
    readKitchenMutationActor: async () => ({ uid: 'cook' }),
    requireKitchenMutationAuthority: async () => {
      if (!allowed) throw Error('Forbidden')
      return { rootData: {}, placeData: { default_currency_code: 'CHF' } }
    },
    readPlaceCurrencyCode: (v) => v.default_currency_code,
    ...utils,
    legacyPlacementSellable,
    normalizeMenuItemPatch,
    serverKitchenSellablesTarget: () => 'sellables',
    serverKitchenMenusTarget: () => 'menus',
    serverKitchenMenuSectionsTarget: () => 'sections',
    serverKitchenMenuItemsTarget: () => 'items',
    serverKitchenDishesTarget: () => 'dishes',
  }
  const commands = {
    ...load(
      'kitchen/server/sellables/bind',
      'bindKitchenMenuSellable',
      dependencies
    ),
    ...load(
      'kitchen/server/sellables/update-terms',
      'updateKitchenSellableTerms',
      dependencies
    ),
  }
  return {
    records,
    ...commands,
    deny: () => {
      allowed = false
    },
  }
}
const binding = {
  kitchenId: 'k',
  menuId: 'food',
  sectionId: 'drinks',
  itemId: 'item',
}
test('trusted adoption is idempotent and reuses only explicitly selected same-Dish terms', async () => {
  const h = commandHarness()
  const first = await h.bindKitchenMenuSellable({}, binding)
  assert.equal(first.sellableId, 'new-offer')
  assert.equal(h.records.get('items/item').price, 4)
  assert.equal((await h.bindKitchenMenuSellable({}, binding)).reused, true)
  assert.equal(
    [...h.records.keys()].filter((k) => k.startsWith('sellables/')).length,
    1
  )
  h.records.set('items/second', { ...legacy, price: 8 })
  await h.bindKitchenMenuSellable(
    {},
    { ...binding, itemId: 'second', sellableId: 'new-offer' }
  )
  assert.equal(h.records.get('items/second').sellable_id, 'new-offer')
  h.records.set('items/wrong', { ...legacy, dish_id: 'pizza' })
  h.records.set('dishes/pizza', { kitchen_id: 'k' })
  await assert.rejects(
    () =>
      h.bindKitchenMenuSellable(
        {},
        { ...binding, itemId: 'wrong', sellableId: 'new-offer' }
      ),
    /does not match/
  )
})
test('commercial writer requires authority and exact revision; stable variants are preserved', async () => {
  const h = commandHarness()
  await h.bindKitchenMenuSellable({}, binding)
  const before = h.records.get('sellables/new-offer')
  const terms = { ...before.terms, prices: { 'new-offer-1': 7 } }
  await h.updateKitchenSellableTerms(
    {},
    { kitchenId: 'k', sellableId: 'new-offer', expectedRevision: 1, terms }
  )
  assert.equal(h.records.get('sellables/new-offer').revision, 2)
  assert.deepEqual(
    h.records.get('sellables/new-offer').variants,
    before.variants
  )
  await assert.rejects(
    () =>
      h.updateKitchenSellableTerms(
        {},
        { kitchenId: 'k', sellableId: 'new-offer', expectedRevision: 1, terms }
      ),
    /changed/
  )
  h.deny()
  await assert.rejects(
    () => h.bindKitchenMenuSellable({}, binding),
    /Forbidden/
  )
  await assert.rejects(
    () =>
      h.updateKitchenSellableTerms(
        {},
        { kitchenId: 'k', sellableId: 'new-offer', expectedRevision: 2, terms }
      ),
    /Forbidden/
  )
})

test('public projection reads reusable commercial truth and never falls back from a broken binding', async () => {
  const records = new Map([
    ['kitchens/k/dishes/coke', { name: 'Coke', item_kind: 'drink' }],
    ['kitchens/k/menus/food/sections/drinks', { label: 'Drinks' }],
    [
      'kitchens/k/menus/food/sections/drinks/items/item',
      { ...legacy, sellable_id: 'shared', price: 999 },
    ],
    ['kitchens/k/sellables/shared', simple()],
  ])
  const database = {
    collection: (path) => ({
      get: async () => ({
        docs: [...records.entries()]
          .filter(
            ([key]) =>
              key.startsWith(path + '/') &&
              key.split('/').length === path.split('/').length + 1
          )
          .map(([key, value]) => ({
            id: key.split('/').at(-1),
            data: () => structuredClone(value),
          })),
      }),
    }),
    doc: (path) => ({
      get: async () => ({
        exists: records.has(path),
        data: () => structuredClone(records.get(path)),
      }),
    }),
  }
  const { readKitchenMenuSections } = load(
    'menu/server/manifest/sections',
    'readKitchenMenuSections',
    {
      ...normalizers,
      ...utils,
      normalizeDishDealFlag: (v) => v === true,
      readDishItemKind: (v) => v,
      readRecord: (v) => v,
      readRecordString: (v, key) => String(v?.[key] || ''),
    }
  )
  const input = { appId: 'app', kitchenId: 'k', menuId: 'food' }
  const first = await readKitchenMenuSections(database, input)
  assert.equal(first[0].items[0].price, 4)
  assert.equal(first[0].items[0].sellable_id, 'shared')
  const changed = simple()
  changed.terms.prices['stable-0'] = 6
  changed.revision = 2
  records.set('kitchens/k/sellables/shared', changed)
  assert.equal(
    (await readKitchenMenuSections(database, input))[0].items[0].price,
    6
  )
  assert.equal(first[0].items[0].price, 4)
  records.delete('kitchens/k/sellables/shared')
  await assert.rejects(
    () => readKitchenMenuSections(database, input),
    /missing/
  )
  records.set('kitchens/k/menus/food/sections/drinks/items/item', legacy)
  assert.equal(
    (await readKitchenMenuSections(database, input))[0].items[0].price,
    4
  )
})

test('structured forms do not infer volume from order quantity and reject invalid dimensions', async () => {
  assert.equal(simple().variants[0].form, undefined)
  for (const form of [
    { volume: { value: 0, unit: 'ml' } },
    { volume: { value: 1, unit: 'kg' } },
    { container: '' },
    { source: 'fountain', nestedVariants: [] },
  ]) {
    const h = commandHarness()
    await assert.rejects(
      () =>
        h.bindKitchenMenuSellable(
          {},
          { ...binding, variantForms: [form], expectedPriceOptions: [] }
        ),
      /Review/
    )
    assert.equal(h.records.has('sellables/new-offer'), false)
    assert.equal(h.records.get('items/item').sellable_id, undefined)
  }
  const h = commandHarness()
  await assert.rejects(
    () =>
      h.bindKitchenMenuSellable(
        {},
        { ...binding, variantForms: [], expectedPriceOptions: [] }
      ),
    /Review/
  )
})

test('adoption refuses supplied forms when reviewed legacy options changed', async () => {
  const h = commandHarness()
  const options = [
    { label: 'Glass', quantity: 1, unit: '', price: 4 },
    { label: 'Bottle', quantity: 1, unit: '', price: 5 },
  ]
  h.records.set('items/item', {
    ...legacy,
    price_options: [...options].reverse(),
  })
  await assert.rejects(
    () =>
      h.bindKitchenMenuSellable(
        {},
        {
          ...binding,
          variantForms: [{ container: 'glass' }, { container: 'bottle' }],
          expectedPriceOptions: options,
        }
      ),
    /options changed/
  )
  assert.equal(h.records.has('sellables/new-offer'), false)
})

test('publication refuses missing or mismatched canonical terms', async () => {
  const { assertKitchenMenuCanPublish } = load(
    'menu/server/publication/validation',
    'assertKitchenMenuCanPublish',
    {
      createError: error,
      ...utils,
      serverKitchenSellablesTarget: () => 'sellables',
      serverKitchenMenuSectionsTarget: () => 'sections',
      serverKitchenMenuItemsTarget: () => 'items',
      serverKitchenDishesTarget: () => 'dishes',
    }
  )
  let sellable
  const tx = {
    readAll: async (target) =>
      target === 'sections'
        ? [{ id: 's', data: {} }]
        : [{ id: 'i', data: { dish_id: 'coke', sellable_id: 'shared' } }],
    read: async (target) =>
      target === 'dishes'
        ? { exists: true, data: {} }
        : { exists: !!sellable, data: sellable },
  }
  const input = { kitchenId: 'k', menuId: 'm', menuData: {} }
  await assert.rejects(() => assertKitchenMenuCanPublish(tx, input), /missing/)
  sellable = { ...simple(), dish_id: 'pizza' }
  await assert.rejects(
    () => assertKitchenMenuCanPublish(tx, input),
    /another Dish/
  )
  sellable = simple()
  await assertKitchenMenuCanPublish(tx, input)
})

test('draft import cannot replace an adopted placement after the initial discovery read', async () => {
  const touched = []
  const { writeKitchenMenuDraft } = load(
    'menu/server/draft/write',
    'writeKitchenMenuDraft',
    {
      createError: error,
      MenuStorage: { scopeCollection: 'menus' },
      getRuntimeFirestore: () => ({
        doc: () => ({
          collection: () => ({
            get: async () => ({
              docs: [
                {
                  id: 's',
                  ref: {
                    collection: () => ({
                      get: async () => ({ docs: [{ id: 'i' }] }),
                    }),
                  },
                },
              ],
            }),
          }),
        }),
      }),
      serverAuditStamp: () => ({}),
      planKitchenMenuDraft: () => ({
        plannedSections: [],
        sproochliCacheUnits: [],
      }),
      serverKitchenMenusTarget: () => 'menus',
      serverKitchenDishesTarget: () => 'dishes',
      serverKitchenMenuItemsTarget: () => 'items',
      requireKitchenMutationAuthority: async () => ({}),
      runGuardedServerTransaction: async (_, work) =>
        work({
          read: async () => ({ exists: true, data: { slug: 'food' } }),
          readMany: async () => [
            {
              id: 'i',
              exists: true,
              data: { sellable_id: 'adopted-between-reads' },
            },
          ],
          update: () => touched.push('update'),
          delete: () => touched.push('delete'),
        }),
    }
  )
  await assert.rejects(
    () =>
      writeKitchenMenuDraft({
        appId: 'a',
        kitchenId: 'k',
        kitchenPath: 'kitchens/k',
        menuId: 'food',
        uid: 'u',
        actor: {},
        sections: [],
      }),
    /shared sellables/
  )
  assert.deepEqual(touched, [])
})
