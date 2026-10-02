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
  'readKitchenSellable,projectSellable,sellableFulfilment'
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
const lines = load(
  'menu/server/ordering/lines',
  'resolveMenuOrderVariant,resolveMenuOrderAddOns',
  { createError: error }
)
function orderResolver(rows) {
  return load('menu/server/ordering/order-items', 'resolveMenuOrderItems', {
    createError: error,
    ...lines,
    ...utils,
    text: (v) => String(v ?? '').trim(),
    numberValue: (v) => Number(v) || 0,
    readKitchenMenuSections: async () => [{ items: rows }],
    isMenuOrderingEnabled: () => true,
    readKitchenMenuOrdering: () => ({
      order_types: [{ kitchen_service_id: 'service', type: 'collection' }],
    }),
  }).resolveMenuOrderItems
}
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
  kitchenServiceId: 'service',
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
test('authoritative order defaults and snapshots stable identity, ignoring client price', async () => {
  const result = await orderResolver([row()])(
    db,
    request({ id: 'stable-0', price: 0.01 })
  )
  assert.equal(result.subtotal, 8)
  assert.equal(result.items[0].sellable_id, 'shared')
  assert.equal(result.items[0].sellable_revision, 1)
  assert.equal(result.items[0].variant_id, 'stable-0')
  const implicit = await orderResolver([row()])(db, request(null))
  assert.equal(implicit.subtotal, 8)
  const changed = simple()
  changed.terms.prices['stable-0'] = 99
  assert.equal(result.items[0].unit_price, 4)
})
test('canonical variants reject stale/wrong IDs and fulfilment/currency mismatch', async () => {
  await assert.rejects(
    () =>
      orderResolver([row()])(db, request({ id: 'wrong', label: 'Default' })),
    /valid sellable variant/
  )
  await assert.rejects(
    () =>
      orderResolver([
        { ...row(), sellable_fulfilment: { 'stable-0': ['on_premise'] } },
      ])(db, request(null)),
    /not eligible/
  )
  await assert.rejects(
    () =>
      orderResolver([{ ...row(), sellable_currency: 'EUR' }])(
        db,
        request(null)
      ),
    /not eligible/
  )
})
test('legacy order path retains label variants and original arithmetic', async () => {
  const legacyRow = {
    id: 'item',
    dish_id: 'coke',
    name: 'Coke',
    item_kind: 'drink',
    price: 4,
    priceOptions: [{ label: 'Bottle', price: 5 }],
    addOns: [],
  }
  const result = await orderResolver([legacyRow])(
    db,
    request({ label: 'Bottle' })
  )
  assert.equal(result.subtotal, 10)
  assert.equal(result.items[0].sellable_id, undefined)
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
    ['dishes/coke', {}],
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
  const commands = load(
    'kitchen/server/sellables/commands',
    'bindKitchenMenuSellable,updateKitchenSellableTerms',
    {
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
        return { rootData: { currency: 'CHF' } }
      },
      readKitchenCurrency: (v) => v.currency,
      ...utils,
      legacyPlacementSellable,
      serverKitchenSellablesTarget: () => 'sellables',
      serverKitchenMenusTarget: () => 'menus',
      serverKitchenMenuSectionsTarget: () => 'sections',
      serverKitchenMenuItemsTarget: () => 'items',
      serverKitchenDishesTarget: () => 'dishes',
    }
  )
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
  h.records.set('dishes/pizza', {})
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
test('same Coke offers fountain on premises and bottle for pickup without channel copies', async () => {
  const record = legacyPlacementSellable(
    {
      ...legacy,
      price_options: [
        { label: 'Fountain', quantity: 300, unit: 'ml', price: 4 },
        { label: 'Bottle', quantity: 500, unit: 'ml', price: 5 },
      ],
    },
    'CHF',
    (i) => `v-${i}`
  )
  record.terms.fulfilment = {
    'v-0': ['on_premise'],
    'v-1': ['on_premise', 'collection', 'delivery'],
  }
  const projected = {
    ...row(),
    ...utils.projectSellable('coke-offer', record, 'coke'),
  }
  await assert.rejects(
    () => orderResolver([projected])(db, request({ id: 'v-0' })),
    /not eligible/
  )
  assert.equal(
    (await orderResolver([projected])(db, request({ id: 'v-1' }))).subtotal,
    10
  )
  assert.equal(utils.sellableFulfilment('takeaway'), 'collection')
  assert.equal(utils.sellableFulfilment('eat_in'), 'on_premise')
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
test('canonical add-ons use exact IDs, not a conflicting client label or price', async () => {
  const item = {
    ...row(),
    addOns: [
      { id: 'a', label: 'A', price: 1 },
      { id: 'b', label: 'B', price: 2 },
    ],
  }
  const input = request(null)
  input.requestedItems[0].addOns = [{ id: 'b', label: 'A', price: 0 }]
  const resolved = await orderResolver([item])(db, input)
  assert.equal(resolved.subtotal, 12)
  assert.equal(resolved.items[0].add_ons[0].id, 'b')
  input.requestedItems[0].addOns.push({ id: 'b' })
  await assert.rejects(() => orderResolver([item])(db, input), /once/)
})
test('persisted order and customer receipt retain sellable and variant identity', async () => {
  const { assembleMenuOrderRecord } = load(
    'menu/server/ordering/order-record',
    'assembleMenuOrderRecord',
    {
      menuOrderTypeStrategy: () => ({ recordsRequestedFor: false }),
      createKitchenOrderPricing: (v) => ({ ...v }),
      numberValue: (v) => Number(v) || 0,
      normalizeKitchenOrderWhatsAppPhone: () => '',
    }
  )
  const resolved = await orderResolver([row()])(db, request(null))
  const assembled = assembleMenuOrderRecord({
    command: {
      actorId: 'menu',
      orderType: 'collection',
      channel: 'menu',
      kitchenServiceId: 'service',
      kitchenServiceName: 'Pickup',
    },
    context: { kitchenId: 'k', menuId: 'food', appId: 'app' },
    currencyCode: 'CHF',
    fulfilment: {
      status: 'pending_acceptance',
      customer: {},
      deliveryFee: 0,
      total: 8,
      payment: { status: 'not_required' },
    },
    identity: {
      id: 'order',
      number: '1',
      capabilityHash: 'hash',
      capabilityToken: 'token',
      timestamp: 'now',
      receiptCreatedAt: 'now',
    },
    items: resolved.items,
    subtotal: resolved.subtotal,
  })
  for (const item of [
    assembled.payload.items[0],
    assembled.response.receipt.items[0],
  ]) {
    assert.equal(item.sellable_id, 'shared')
    assert.equal(item.sellable_revision, 1)
    assert.equal(item.variant_id, 'stable-0')
  }
  assert.equal(assembled.payload.items[0].label, 'Coke')
})

test('operator adoption preserves four flat Coke forms through public selection and order snapshot', async () => {
  const forms = [
    {
      volume: { value: 300, unit: 'ml' },
      container: 'glass',
      source: 'fountain',
    },
    {
      volume: { value: 500, unit: 'ml' },
      container: 'glass',
      source: 'fountain',
    },
    { volume: { value: 500, unit: 'ml' }, container: 'bottle' },
    { volume: { value: 330, unit: 'ml' }, container: 'can' },
  ]
  const h = commandHarness()
  h.records.set('items/item', {
    ...legacy,
    price_options: forms.map((form, i) => ({
      label: [`${form.volume.value}ml`, form.container, form.source]
        .filter(Boolean)
        .join(' · '),
      quantity: 1,
      unit: '',
      price: i + 4,
    })),
  })
  await h.bindKitchenMenuSellable(
    {},
    {
      ...binding,
      variantForms: forms,
      expectedPriceOptions: h.records.get('items/item').price_options,
    }
  )
  const canonical = h.records.get('sellables/new-offer')
  assert.deepEqual(
    canonical.variants.map((v) => v.form),
    forms
  )
  assert.equal(new Set(canonical.variants.map((v) => v.id)).size, 4)
  assert.equal(
    [...h.records.keys()].filter((k) => k.startsWith('dishes/')).length,
    1
  )
  const projected = {
    ...row(),
    ...utils.projectSellable('new-offer', canonical, 'coke'),
  }
  const { readMenuManifestSections } = load(
    'menu/server/payload/sections',
    'readMenuManifestSections',
    { normalizeDishDealFlag: (v) => !!v, readDishItemKind: (v) => v }
  )
  const publicItem = readMenuManifestSections([
    { label: 'Drinks', items: [projected] },
  ])[0].items[0]
  assert.equal(publicItem.priceOptions.length, 4)
  for (const [index, choice] of publicItem.priceOptions.entries()) {
    const resolved = await orderResolver([projected])(
      db,
      request({ ...choice, price: 0.01 })
    )
    assert.equal(resolved.items[0].variant_id, canonical.variants[index].id)
    assert.equal(resolved.items[0].unit_price, index + 4)
    assert.equal(resolved.items[0].sellable_revision, 1)
  }
  assert.equal(publicItem.dishId, 'coke')
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

test('adopted pickup order follows existing Incoming, preparation, ready and immutable Sale spine', async () => {
  const money = load(
    '../../../fireux-finance/src/runtime/utils/money',
    'addFinancialMoney,financialMoneyFromDecimal,multiplyFinancialMoney,financialCurrencyMinorUnitDigits,requireFinancialMoney'
  )
  const pricing = load(
    'kitchen/server/orders/pricing',
    'createKitchenOrderPricing,requireKitchenOrderPricing',
    money
  )
  const lifecycle = load(
    'kitchen/models/order-lifecycle.model',
    'isKitchenOrderStatus,kitchenOrderTransitionRule,isKitchenOrderType,isKitchenOrderChannel,deriveKitchenOrderBoardStage'
  )
  const transition = load(
    'kitchen/server/orders/transition',
    'buildKitchenOrderTransitionPatch',
    {
      ...lifecycle,
      createError: error,
      Timestamp: { fromMillis: (value) => value },
    }
  )
  const saleHelpers = load(
    'kitchen/utils/sale',
    'KitchenSaleSchemaVersion,kitchenSalePath'
  )
  const { createHash } = await import('node:crypto')
  const facts = load(
    '../../../fireux-finance/src/runtime/server/finance/financial-fact',
    'buildFinancialFact,financialFactPath',
    { createHash, ...money, FinancialFactSchemaVersion: 1 }
  )
  const { buildCompletedKitchenOrderSale } = load(
    'kitchen/server/orders/sale',
    'buildCompletedKitchenOrderSale',
    { ...money, ...pricing, ...lifecycle, ...saleHelpers, ...facts }
  )
  const { assembleMenuOrderRecord } = load(
    'menu/server/ordering/order-record',
    'assembleMenuOrderRecord',
    {
      ...pricing,
      menuOrderTypeStrategy: () => ({ recordsRequestedFor: false }),
      numberValue: (v) => Number(v) || 0,
      normalizeKitchenOrderWhatsAppPhone: () => '',
    }
  )
  const h = commandHarness()
  await h.bindKitchenMenuSellable({}, binding)
  const canonical = h.records.get('sellables/new-offer')
  const resolved = await orderResolver([
    { ...row(), ...utils.projectSellable('new-offer', canonical, 'coke') },
  ])(db, request(null))
  const assembled = assembleMenuOrderRecord({
    command: {
      actorId: 'menu',
      orderType: 'collection',
      channel: 'menu',
      kitchenServiceId: 'pickup',
      kitchenServiceName: 'Pickup',
    },
    context: { kitchenId: 'k', menuId: 'food', appId: 'app' },
    currencyCode: 'CHF',
    fulfilment: {
      status: 'pending_acceptance',
      customer: {},
      deliveryFee: 0,
      total: resolved.subtotal,
      payment: { status: 'not_required', method: 'cash' },
    },
    identity: {
      id: 'controlled-order',
      number: '1',
      capabilityHash: 'hash',
      capabilityToken: 'token',
      timestamp: 'now',
      receiptCreatedAt: 'now',
    },
    items: resolved.items,
    subtotal: resolved.subtotal,
  })
  const order = { ...assembled.payload, id: 'controlled-order' }
  assert.equal(lifecycle.deriveKitchenOrderBoardStage(order), 'incoming')
  Object.assign(
    order,
    transition.buildKitchenOrderTransitionPatch(order, 'accept', {
      estimatedMinutes: 20,
      nowMs: 0,
    })
  )
  assert.equal(lifecycle.deriveKitchenOrderBoardStage(order), 'queue')
  assert.throws(
    () => transition.buildKitchenOrderTransitionPatch(order, 'complete'),
    /Cannot/
  )
  Object.assign(
    order,
    transition.buildKitchenOrderTransitionPatch(order, 'mark_ready')
  )
  assert.equal(lifecycle.deriveKitchenOrderBoardStage(order), 'pass')
  // Shared price changes after ordering never alter the sale's frozen order values.
  canonical.terms.prices['new-offer-1'] = 999
  const completed = buildCompletedKitchenOrderSale({
    appId: 'app',
    kitchenId: 'k',
    orderId: order.id,
    order,
    actorId: 'cook',
    timestamp: 'completed',
  })
  assert.equal(completed.sale.lines[0].sellable_id, 'new-offer')
  assert.equal(completed.sale.lines[0].sellable_revision, 1)
  assert.equal(completed.sale.lines[0].variant_id, 'new-offer-1')
  assert.equal(completed.sale.pricing.total.amount_minor, 800)
  assert.equal(completed.financialFact.amount_minor, 800)
  assert.equal(completed.financialFact.source.path, completed.salePath)
  Object.assign(
    order,
    transition.buildKitchenOrderTransitionPatch(order, 'complete')
  )
  assert.equal(lifecycle.deriveKitchenOrderBoardStage(order), 'recent')
  assert.throws(
    () =>
      buildCompletedKitchenOrderSale({
        appId: 'app',
        kitchenId: 'k',
        orderId: order.id,
        order,
        actorId: 'cook',
        timestamp: 'again',
      }),
    /Only a ready/
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
