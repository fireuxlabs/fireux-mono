import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref, toValue, watch, effectScope } from 'vue'
import {
  loadOfferingSource,
  testKitchenHours,
} from './offering-test-helpers.mjs'
import {
  makeMenuOrdering,
  checkoutBasket,
  checkoutSelections,
} from './helpers/menu-checkout.mjs'
import {
  load,
  normalizeKitchenOfferings,
  kioskService,
} from './kitchen/offering-test-helpers.mjs'

const timeCore = load(
  '../../runtime/utils/weekday-time-core.ts',
  'weekdayTimeCore'
)
const timeConfig = load(
  '../../runtime/utils/weekday-time-config.ts',
  'weekdayTimeConfig',
  timeCore
)
const timeFormat = load(
  '../../runtime/utils/weekday-time-format.ts',
  'weekdayTimeFormat',
  { ...timeCore, ...timeConfig }
)
const timeState = load(
  '../../runtime/utils/weekday-time-state.ts',
  'weekdayTimeState',
  { ...timeCore, ...timeConfig, ...timeFormat }
)
const table = load(
  '../../runtime/kitchen/utils/table-service.ts',
  'tableChannelEnabled'
)
const services = loadOfferingSource(
  'menu/utils/menu-ordering',
  'kitchenMenuOrdering,publicMenuOrderTypes,publicMenuServiceOpen',
  {
    normalizeKitchenOfferings,
    ...table,
    readWeekdayTimeOpenState: timeState.weekdayTimeState.open,
  }
)
const publicService = {
  ...kioskService,
  id: 'collection',
  menu_ids: ['food', 'drinks'],
  hours_source: 'custom',
  hours: testKitchenHours(),
  interactions: [{ type: 'collection', enabled: true }],
}
const target = (collectionPath) => ({ collectionPath })
const ordering = makeMenuOrdering({
  ...services,
  serverKitchenMenusTarget: (k) => target(`kitchens/${k}/menus`),
  serverKitchenMenuSectionsTarget: (k, m) =>
    target(`kitchens/${k}/menus/${m}/sections`),
  serverKitchenMenuItemsTarget: (k, m, s) =>
    target(`kitchens/${k}/menus/${m}/sections/${s}/items`),
  serverKitchenDishesTarget: (k) => target(`kitchens/${k}/dishes`),
  kitchenPromotionsTarget: (k) => target(`kitchens/${k}/promotions`),
  FIRESTORE_MUTATION_TARGETS: {
    places: target('places'),
    kitchens: target('kitchens'),
  },
  readPlaceCurrencyCode: (place) => place.currency,
  readKitchenOfferingsInTransaction: async (tx) => tx.offerings,
})
function catalogue() {
  const records = new Map([
    ['places/venue', { currency: 'CHF' }],
    ['kitchens/venue', {}],
    ['kitchens/venue/menus/food', { status: 'published' }],
    ['kitchens/venue/menus/drinks', { status: 'published' }],
    ['kitchens/venue/menus/food/sections/main', { status: 'active' }],
    ['kitchens/venue/menus/drinks/sections/main', { status: 'active' }],
    [
      'kitchens/venue/menus/food/sections/main/items/pizza',
      { dish_id: 'pizza' },
    ],
    [
      'kitchens/venue/menus/drinks/sections/main/items/cola',
      { dish_id: 'cola' },
    ],
    [
      'kitchens/venue/menus/food/sections/main/items/deal',
      { promotion_id: 'meal' },
    ],
    [
      'kitchens/venue/dishes/pizza',
      {
        name: 'Pizza',
        price: 13,
        price_options: [
          { label: 'Large', quantity: 1, unit: 'portion', price: 15 },
        ],
        add_ons: [{ id: 'cheese', label: 'Cheese', price: 1.5 }],
      },
    ],
    [
      'kitchens/venue/dishes/cola',
      { name: 'Cola', price: 4, bottle_deposit: 10 },
    ],
    [
      'kitchens/venue/promotions/meal',
      {
        name: 'Lunch deal',
        status: 'active',
        currency: 'CHF',
        days: ['monday'],
        price: 15,
        groups: [
          {
            id: 'main',
            name: 'Main',
            choose: 1,
            dishes: [{ dishId: 'pizza', supplement: 2 }],
          },
        ],
      },
    ],
  ])
  const tx = {
    offerings: [publicService],
    read: async (t, id) => ({
      exists: records.has(`${t.collectionPath}/${id}`),
      data: records.get(`${t.collectionPath}/${id}`),
    }),
    readAll: async (t, limit, after) =>
      [...records]
        .filter(([path]) => path.startsWith(t.collectionPath + '/'))
        .map(([path, data]) => ({ id: path.split('/').at(-1), data }))
        .sort((a, b) => a.id.localeCompare(b.id))
        .filter((row) => !after || row.id > after)
        .slice(0, limit),
  }
  return { records, tx }
}
const selections = [
  {
    menuId: 'food',
    sectionId: 'main',
    itemId: 'pizza',
    quantity: 2,
    optionId: 'large',
    extraIds: ['cheese'],
    offeringIds: ['collection'],
    expectedUnitMinor: 1650,
  },
  {
    menuId: 'drinks',
    sectionId: 'main',
    itemId: 'cola',
    quantity: 1,
    bottle: 'deposit',
    offeringIds: ['collection'],
    expectedUnitMinor: 1400,
  },
  {
    menuId: 'drinks',
    sectionId: 'main',
    itemId: 'cola',
    quantity: 1,
    bottle: 'exchange',
    offeringIds: ['collection'],
    expectedUnitMinor: 400,
  },
  {
    menuId: 'food',
    sectionId: 'main',
    itemId: 'deal',
    quantity: 1,
    groups: { main: ['pizza'] },
    offeringIds: ['collection'],
    expectedUnitMinor: 1700,
  },
]
const input = (value = selections, total = 68) => ({
  kitchenId: 'venue',
  menuId: 'food',
  selections: checkoutSelections.readMenuOrderSelections(value),
  fulfilment: 'collection',
  expectedTotal: total,
})
const monday = new Date('2026-10-19T12:00:00Z')

test('one canonical checkout resolves two menus, variants, extras, meal supplements and both bottle choices', async () => {
  const { records, tx } = catalogue(),
    before = structuredClone(records)
  const result = await ordering.resolveMenuOrderLines(tx, input(), monday)
  assert.equal(result.lines.length, 4)
  assert.equal(result.pricing.total, 68)
  assert.deepEqual(
    result.pricing.lines.map((line) => line.unit_price),
    [16.5, 14, 4, 17]
  )
  assert.equal(result.lines[0].item.name, 'Pizza — Large')
  assert.deepEqual(result.lines[0].notes, ['Cheese (+CHF 1.50)'])
  assert.deepEqual(result.lines[1].notes, [
    'Bottle deposit · CHF 10.00 per bottle',
  ])
  assert.deepEqual(result.lines[2].notes, ['Bottle exchange · no deposit'])
  assert.deepEqual(result.lines[3].notes, ['Main: Pizza (+CHF 2.00)'])
  assert.deepEqual(records, before)
})

test('server rejects tampered choices, prices, foreign sources and missing menu/service availability', async () => {
  for (const [change, pattern] of [
    [(rows) => (rows[0].extraIds = ['invented']), /extra/],
    [(rows) => (rows[0].optionId = 'invented'), /option/],
    [(rows) => (rows[0].menuId = 'foreign-kitchen-menu'), /menu is no longer/],
    [
      (rows) => (rows[0].offeringIds = ['delivery']),
      /does not currently offer/,
    ],
    [(rows) => (rows[1].bottle = undefined), /bottle/],
    [(rows) => (rows[3].groups = { main: [] }), /Choose 1/],
    [(rows) => (rows[3].groups = { unknown: ['pizza'] }), /Choose 1/],
    [(rows) => (rows[0].expectedUnitMinor = 1), /prices changed/],
  ]) {
    const { tx } = catalogue(),
      rows = structuredClone(selections)
    change(rows)
    await assert.rejects(
      ordering.resolveMenuOrderLines(tx, input(rows), monday),
      pattern
    )
  }
  for (const path of [
    'kitchens/venue/menus/drinks',
    'kitchens/venue/menus/drinks/sections/main',
    'kitchens/venue/menus/drinks/sections/main/items/cola',
    'kitchens/venue/dishes/cola',
  ]) {
    const { records, tx } = catalogue()
    records.delete(path)
    await assert.rejects(
      ordering.resolveMenuOrderLines(tx, input(), monday),
      /unavailable|no longer available/
    )
  }
  const { records, tx } = catalogue()
  records.get('kitchens/venue/menus/drinks').serving_hours = {
    ...testKitchenHours(),
    windows: [{ days: ['tuesday'], open: '12:00', close: '13:00' }],
  }
  await assert.rejects(
    ordering.resolveMenuOrderLines(tx, input(), monday),
    /closed/
  )
  tx.offerings = [{ ...publicService, enabled: false }]
  await assert.rejects(
    ordering.resolveMenuOrderLines(tx, input(), monday),
    /does not currently offer/
  )
})

test('standalone dish offers use the serving weekday without changing the normal Dish price', async () => {
  const { records, tx } = catalogue()
  records.set('kitchens/venue/promotions/pizzas', {
    name: 'Monday pizzas',
    status: 'active',
    currency: 'CHF',
    days: ['monday'],
    dishes: [{ dishId: 'pizza', price: 11 }],
  })
  const rows = [{ ...selections[0], quantity: 1, expectedUnitMinor: 1250 }]
  const result = await ordering.resolveMenuOrderLines(
    tx,
    input(rows, 12.5),
    monday
  )
  assert.equal(result.pricing.total, 12.5)
  assert.equal(records.get('kitchens/venue/dishes/pizza').price, 13)
  await assert.rejects(
    ordering.resolveMenuOrderLines(
      tx,
      input(rows, 12.5),
      new Date('2026-10-20T12:00:00Z')
    ),
    /prices changed/
  )
  records.get('kitchens/venue/promotions/meal').status = 'paused'
  await assert.rejects(
    ordering.resolveMenuOrderLines(tx, input([selections[3]], 17), monday),
    /meal deal is unavailable/
  )
})

const helpers = loadOfferingSource(
  'menu/utils/collection-checkout',
  'collectionOrder,collectionSelections'
)
const basketReader = loadOfferingSource(
  'menu/composables/useServiceBasket',
  'useServiceBasket',
  { computed, ref, toValue, ...checkoutBasket }
)
const orderPolicy = loadOfferingSource(
  'kitchen/utils/order-submission',
  'orderSubmissionIssues'
)
const offer = {
  source: {
    kitchenId: 'venue',
    menuId: 'food',
    menuSlug: 'main-menu',
    sectionId: 'main',
  },
  presentation: { currencyCode: 'CHF' },
  offerings: [{ id: 'collection', hours: testKitchenHours() }],
  item: { id: 'pizza', name: 'Pizza', price: 13, priceOptions: [], addOns: [] },
}
function checkoutHarness(options = {}) {
  const scope = effectScope(),
    requests = [],
    responses = [...(options.responses || [])],
    mounts = [],
    storage = options.storage || new Map(),
    currentUser = options.currentUser || ref({ uid: 'customer' }),
    kitchenSlug = options.kitchenSlug || ref('venue'),
    entryId = options.entryId || ref('')
  const onMounted = (callback) => mounts.push(callback)
  const sessionReader = loadOfferingSource(
    'menu/utils/collection-recovery',
    'readCollectionSession',
    helpers
  )
  const recoveryReader = loadOfferingSource(
    'menu/composables/useCollectionRecovery',
    'useCollectionRecovery',
    {
      computed,
      ref,
      watch,
      onMounted,
      ...sessionReader,
      sessionStorage: {
        getItem: (key) => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
    }
  )
  const offers = ref([offer]),
    ready = ref(true),
    failureStatus = ref(0),
    version = ref(0)
  let basket, checkout
  const { useCollectionCheckout } = loadOfferingSource(
    'menu/composables/useCollectionCheckout',
    'useCollectionCheckout',
    {
      computed,
      ref,
      watch,
      onMounted,
      setInterval: () => 0,
      clearInterval() {},
      ...recoveryReader,
      useFireUXConfig: () => ({ appId: 'app' }),
      onScopeDispose() {},
      ...helpers,
      ...orderPolicy,
      ...checkoutBasket,
      useAuth: () => ({ currentUser }),
      useRuntimeConfig: () => ({
        public: { ordering: { channels: ['website'] } },
      }),
      useKitchenOfferingNow: () => ({ now: ref(monday) }),
      readOpeningHoursStatus: () => ({ open: true }),
      useOrderExchange: () => ({
        pending: ref(false),
        error: ref(''),
        version,
        failureStatus,
        request: async (path, payload) => {
          requests.push({ path, payload })
          failureStatus.value = 0
          const result = responses.shift()
          if (result?.failureStatus) {
            failureStatus.value = result.failureStatus
            return null
          }
          return result || null
        },
      }),
    }
  )
  scope.run(() => {
    basket = basketReader.useServiceBasket(offers, ready)
    if (options.seed !== false)
      basket.add(offer, { optionId: '', extraIds: [], groups: {}, quantity: 1 })
    checkout = useCollectionCheckout({
      basket,
      offers,
      ready,
      kitchenSlug,
      entryId,
    })
    for (const mount of mounts) mount()
    if (options.seed !== false) {
      checkout.name.value = 'Sam'
      checkout.phone.value = '123'
    }
  })
  return {
    scope,
    basket,
    checkout,
    offers,
    ready,
    requests,
    responses,
    failureStatus,
    version,
    currentUser,
    kitchenSlug,
    entryId,
    storage,
  }
}

test('checkout retries the same immutable order reference and payload after an ambiguous failure', async () => {
  const state = checkoutHarness()
  try {
    await state.checkout.submit()
    assert.equal(state.checkout.locked.value, true)
    assert.equal(state.requests[0].path, '/api/ordering/menu-submit')
    assert.equal(state.requests[0].payload.expectedTotal, 13)
    assert.equal(state.requests[0].payload.menuId, 'main-menu')
    assert.equal(state.requests[0].payload.selections[0].menuId, 'food')
    state.basket.lines.value[0].choices.quantity = 2
    state.responses.push({
      order: { id: state.requests[0].payload.order.id },
      state: 'received',
    })
    await state.checkout.submit()
    assert.deepEqual(state.requests[1], state.requests[0])
    assert.equal(state.checkout.submission.value.state, 'received')
    await state.checkout.submit()
    assert.equal(state.requests.length, 2)
  } finally {
    state.scope.stop()
  }
})

test('checkout blocks stale/unverified baskets and unlocks editing after a definite server rejection', async () => {
  const state = checkoutHarness()
  try {
    state.ready.value = false
    await state.checkout.submit()
    assert.equal(state.requests.length, 0)
    state.ready.value = true
    state.offers.value = []
    await state.checkout.submit()
    assert.equal(state.requests.length, 0)
    state.offers.value = [offer]
    state.responses.push({ failureStatus: 409 }, { failureStatus: 404 })
    await state.checkout.submit()
    assert.equal(state.checkout.locked.value, false)
    const firstId = state.requests[0].payload.order.id
    state.failureStatus.value = 0
    await state.checkout.submit()
    assert.notEqual(state.requests[2].payload.order.id, firstId)
    state.currentUser.value = { uid: 'other' }
    await Promise.resolve()
    assert.equal(state.checkout.locked.value, false)
    assert.equal(state.checkout.name.value, '')
  } finally {
    state.scope.stop()
  }
})

test('the existing command stores canonical choices once and retries without another order or price write', async () => {
  const { records, tx } = catalogue()
  const beforeDishes = structuredClone(
    [...records].filter(([path]) => path.includes('/dishes/'))
  )
  const channels = loadOfferingSource(
    'kitchen/models/order.model',
    'OrderChannels'
  )
  const orderModel = loadOfferingSource(
    'kitchen/utils/ordering',
    'readOrder,requireOrderChannel',
    channels
  )
  const states = loadOfferingSource(
    'kitchen/models/order-submission.model',
    'OrderSubmissionStates'
  )
  const submissionPolicy = loadOfferingSource(
    'kitchen/utils/order-submission',
    'orderSubmissionIssues,initialOrderSubmissionState,readOrderSubmission',
    { ...orderModel, ...states }
  )
  const { submitKitchenOrder } = loadOfferingSource(
    'kitchen/server/orders/submission',
    'submitKitchenOrder',
    {
      ...orderModel,
      ...submissionPolicy,
      createHash,
      createError: (value) =>
        Object.assign(new Error(value.statusMessage), value),
      requireFirestoreDocumentId: (value) => {
        if (typeof value !== 'string' || !value || value.includes('/'))
          throw new Error('Invalid id')
        return value
      },
      defineFirestoreMutationTarget: (value) => value,
      FIRESTORE_MUTATION_TARGETS: {
        kitchens: target('kitchens'),
        runtimeUsers: target('users'),
      },
      resolveMenuOrderLines: (transaction, input) =>
        ordering.resolveMenuOrderLines(transaction, input, monday),
      serverAuditStamp: () => ({ at: 'test' }),
      runGuardedServerTransaction: async (_database, run) => {
        const staged = []
        const result = await run({
          ...tx,
          create: (target, id, data) =>
            staged.push([`${target.collectionPath}/${id}`, data]),
          update: (target, id, data) =>
            staged.push([
              `${target.collectionPath}/${id}`,
              { ...records.get(`${target.collectionPath}/${id}`), ...data },
            ]),
        })
        for (const [path, data] of staged) records.set(path, data)
        return result
      },
    }
  )
  const actor = {
    callerUid: 'customer',
    appId: 'app',
    isTenant: false,
    ordering: { channels: ['website'] },
    operator: null,
  }
  const order = {
    id: 'checkout-test',
    number: '',
    channel: 'website',
    fulfilment: 'collection',
    customer: { name: 'Sam', phone: '123' },
    lines: [
      {
        id: 'client',
        item: { name: 'Untrusted display name' },
        quantity: 1,
        unit_code: 'C62',
      },
    ],
  }
  const context = {
    target: { sourceMenuId: 'food', kitchenSlug: 'venue' },
    selections: input().selections,
    expectedTotal: 68,
  }
  const result = await submitKitchenOrder(
    actor,
    { kitchenId: 'venue', order },
    context
  )
  assert.equal(result.submission.order.number, '1')
  assert.equal(result.submission.order.lines.length, 4)
  assert.deepEqual(result.submission.order.lines[3].notes, [
    'Main: Pizza (+CHF 2.00)',
  ])
  assert.equal(result.submission.pricing.total, 68)
  const saved = records.get('kitchens/venue/submitted-orders/checkout-test')
  assert.deepEqual(saved.menu.selections, context.selections)
  assert.equal(saved.menu.selections[1].bottle, 'deposit')
  assert.equal(saved.menu.selections[2].bottle, 'exchange')
  const again = await submitKitchenOrder(
    actor,
    { kitchenId: 'venue', order },
    context
  )
  assert.deepEqual(again.submission, result.submission)
  assert.equal(records.get('kitchens/venue/order-counters/sequence').value, 1)
  await assert.rejects(
    submitKitchenOrder(
      actor,
      {
        kitchenId: 'venue',
        order: { ...order, customer: { name: 'Other', phone: '123' } },
      },
      context
    ),
    /reference has already been used/
  )
  assert.deepEqual(
    [...records].filter(([path]) => path.includes('/dishes/')),
    beforeDishes
  )
})

test('selection parsing rejects invented fields and malformed or repeated choices', () => {
  for (const mutate of [
    (row) => (row.kitchenId = 'other'),
    (row) => (row.groups = []),
    (row) => (row.extraIds = ['cheese', 'cheese']),
    (row) => (row.bottle = 'free'),
    (row) => (row.expectedUnitMinor = -1),
    (row) => (row.quantity = 1.5),
  ]) {
    const row = structuredClone(selections[0])
    mutate(row)
    assert.throws(() => checkoutSelections.readMenuOrderSelections([row]))
  }
  assert.throws(
    () =>
      checkoutSelections.readMenuOrderSelections([
        selections[0],
        selections[0],
      ]),
    /Combine/
  )
})

test('a rejected retry checks the existing receipt before allowing another attempt', async () => {
  const state = checkoutHarness()
  try {
    await state.checkout.submit()
    const id = state.requests[0].payload.order.id
    state.responses.push(
      { failureStatus: 404 },
      { order: { id }, state: 'received' }
    )
    await state.checkout.submit()
    assert.equal(state.requests[1].payload.order.id, id)
    assert.deepEqual(state.requests[2], {
      path: '/api/ordering/response',
      payload: { orderId: id },
    })
    assert.equal(state.checkout.submission.value.order.id, id)
    assert.equal(state.checkout.locked.value, true)
  } finally {
    state.scope.stop()
  }
})

test('the existing endpoint carries the route slug and full multi-menu selections to the existing command', async () => {
  let called
  const body = {
    kitchenId: 'venue',
    kitchenSlug: 'venue-slug',
    menuId: 'main-menu',
    selections,
    expectedTotal: 68,
    order: { channel: 'website', fulfilment: 'collection' },
  }
  const { handler } = loadSubmitEndpoint({
    defineEventHandler: (fn) => fn,
    readBody: async () => body,
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    resolveMenuTarget: async (menuId, kitchenSlug) => {
      assert.equal(menuId, 'main-menu')
      assert.equal(kitchenSlug, 'venue-slug')
      return { kitchenId: 'venue', sourceMenuId: 'food' }
    },
    ...checkoutSelections,
    submitKitchenOrderRequest: async (_event, input, context) => {
      called = { input, context }
      return { ok: true }
    },
  })
  assert.deepEqual(await handler({}), { ok: true })
  assert.equal(called.context.selections.length, 4)
  assert.equal(called.context.selections[1].menuId, 'drinks')
  assert.deepEqual(called.context.selections[3].groups, { main: ['pizza'] })
  body.kitchenId = 'foreign'
  await assert.rejects(handler({}), /website ordering channel/)
})

function loadSubmitEndpoint(dependencies) {
  const source = readFileSync(
    new URL(
      '../runtime/server/api/ordering/menu-submit.post.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(
      'export default defineEventHandler',
      'const handler = defineEventHandler'
    )
  return compileFunction(
    stripTypeScriptTypes(source) + '; return { handler }',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

test('refresh restores the exact basket choices and customer fields without placing an order', () => {
  const state = checkoutHarness()
  const drink = {
    ...offer,
    source: { ...offer.source, menuId: 'drinks', sectionId: 'soft' },
    item: {
      id: 'cola',
      name: 'Cola',
      price: 4,
      bottleDeposit: 10,
      priceOptions: [],
      addOns: [],
    },
  }
  state.offers.value.push(drink)
  state.basket.add(drink, {
    optionId: '',
    extraIds: [],
    groups: {},
    bottle: 'exchange',
    quantity: 2,
  })
  const before = JSON.parse(JSON.stringify(state.basket.lines.value))
  state.scope.stop()
  const restored = checkoutHarness({ storage: state.storage, seed: false })
  try {
    assert.deepEqual(
      JSON.parse(JSON.stringify(restored.basket.lines.value)),
      before
    )
    assert.equal(restored.basket.totalMinor.value, 2100)
    assert.equal(restored.checkout.name.value, 'Sam')
    assert.equal(restored.checkout.phone.value, '123')
    assert.equal(restored.requests.length, 0)
    assert.equal(
      restored.basket.staleKeys.value.length,
      1,
      'unavailable restored drink is flagged'
    )
    assert.match(
      restored.checkout.issues.value.join(' '),
      /changed or unavailable/
    )
    restored.offers.value.push(drink)
    assert.equal(restored.basket.staleKeys.value.length, 0)
    restored.offers.value[0] = { ...offer, item: { ...offer.item, price: 14 } }
    assert.equal(restored.basket.staleKeys.value.length, 1)
    assert.equal(
      restored.basket.totalMinor.value,
      2100,
      'refresh never silently reprices selections'
    )
    restored.ready.value = false
    assert.match(restored.checkout.issues.value.join(' '), /reload/)
  } finally {
    restored.scope.stop()
  }
})

test('an uncertain submission survives refresh and retries the identical payload even if the catalogue changes', async () => {
  const state = checkoutHarness()
  await state.checkout.submit()
  const sent = state.requests[0].payload
  state.scope.stop()
  const restored = checkoutHarness({ storage: state.storage, seed: false })
  try {
    await Promise.resolve()
    assert.deepEqual(restored.requests, [
      { path: '/api/ordering/response', payload: { orderId: sent.order.id } },
    ])
    assert.equal(restored.checkout.locked.value, true)
    restored.offers.value = []
    restored.ready.value = false
    restored.responses.push({ order: { id: sent.order.id }, state: 'received' })
    await restored.checkout.submit()
    assert.deepEqual(restored.requests[1], {
      path: '/api/ordering/menu-submit',
      payload: sent,
    })
    assert.equal(restored.checkout.submission.value.order.id, sent.order.id)
  } finally {
    restored.scope.stop()
  }
})

test('a confirmed order resumes its response after refresh and reset clears the saved session', async () => {
  const state = checkoutHarness()
  await state.checkout.submit()
  const sent = state.requests[0].payload
  state.responses.push({ order: { id: sent.order.id }, state: 'accepted' })
  await state.checkout.submit()
  state.scope.stop()
  const restored = checkoutHarness({
    storage: state.storage,
    seed: false,
    responses: [{ order: { id: sent.order.id }, state: 'ready' }],
  })
  try {
    await Promise.resolve()
    await Promise.resolve()
    assert.equal(restored.checkout.submission.value.state, 'ready')
    assert.equal(restored.requests.length, 1)
    assert.equal(restored.requests[0].path, '/api/ordering/response')
    restored.checkout.reset()
    assert.equal(restored.storage.size, 0)
    assert.equal(restored.basket.count.value, 0)
    assert.equal(restored.checkout.locked.value, false)
  } finally {
    restored.scope.stop()
  }
})

test('session recovery waits for identity and separates customer, Kitchen and Collection entrance', async () => {
  const state = checkoutHarness()
  state.scope.stop()
  const user = ref(null)
  const restored = checkoutHarness({
    storage: state.storage,
    seed: false,
    currentUser: user,
  })
  try {
    assert.equal(restored.basket.count.value, 0)
    user.value = { uid: 'customer' }
    assert.equal(restored.basket.count.value, 1)
    user.value = { uid: 'other' }
    assert.equal(restored.basket.count.value, 0)
    assert.equal(restored.checkout.name.value, '')
    user.value = { uid: 'customer' }
    assert.equal(restored.basket.count.value, 1)
    restored.entryId.value = 'separate-service'
    assert.equal(restored.basket.count.value, 0)
    restored.entryId.value = ''
    assert.equal(restored.basket.count.value, 1)
    restored.kitchenSlug.value = 'other-venue'
    assert.equal(restored.basket.count.value, 0)
    assert.equal(restored.requests.length, 0)
  } finally {
    restored.scope.stop()
  }
})

test('malformed recovery data is ignored and blocked browser storage does not break the basket', () => {
  const state = checkoutHarness()
  const key = [...state.storage.keys()][0]
  state.scope.stop()
  for (const raw of [
    '{invalid',
    JSON.stringify({ lines: [{}], name: '', phone: '', attempt: null }),
  ]) {
    const restored = checkoutHarness({
      storage: new Map([[key, raw]]),
      seed: false,
    })
    assert.equal(restored.basket.count.value, 0)
    assert.equal(restored.checkout.locked.value, false)
    restored.scope.stop()
  }
  const blocked = checkoutHarness({
    storage: {
      get() {
        throw Error('Storage blocked')
      },
      set() {
        throw Error('Storage blocked')
      },
      delete() {
        throw Error('Storage blocked')
      },
    },
  })
  try {
    assert.equal(blocked.basket.count.value, 1)
    assert.match(
      blocked.checkout.recoveryError.value,
      /recovery is unavailable/
    )
  } finally {
    blocked.scope.stop()
  }
})

test('recovery preserves variants, extras, meal supplements and both bottle choices exactly', async () => {
  const state = checkoutHarness()
  state.basket.clear()
  const pizza = {
    ...offer,
    item: {
      ...offer.item,
      priceOptions: [{ id: 'large', label: 'Large', price: 15 }],
      addOns: [{ id: 'cheese', label: 'Cheese', price: 1.5 }],
    },
  }
  const drink = {
    ...offer,
    source: { ...offer.source, menuId: 'drinks' },
    item: {
      ...offer.item,
      id: 'cola',
      name: 'Cola',
      price: 4,
      bottleDeposit: 10,
    },
  }
  const deal = {
    ...offer,
    item: {
      ...offer.item,
      id: 'deal',
      name: 'Meal',
      price: 15,
      mealDeal: {
        promotionId: 'meal',
        groups: [
          {
            id: 'main',
            name: 'Main',
            choose: 1,
            dishes: [{ dishId: 'pizza', name: 'Pizza', supplement: 2 }],
          },
        ],
      },
    },
  }
  state.offers.value = [pizza, drink, deal]
  const choices = { optionId: '', extraIds: [], groups: {}, quantity: 1 }
  state.basket.add(pizza, {
    ...choices,
    optionId: 'large',
    extraIds: ['cheese'],
    quantity: 2,
  })
  state.basket.add(drink, { ...choices, bottle: 'deposit' })
  state.basket.add(drink, { ...choices, bottle: 'exchange' })
  state.basket.add(deal, { ...choices, groups: { main: ['pizza'] } })
  await state.checkout.submit()
  const sent = state.requests[0].payload
  state.scope.stop()
  const restored = checkoutHarness({ storage: state.storage, seed: false })
  try {
    await Promise.resolve()
    assert.equal(restored.basket.totalMinor.value, 6800)
    assert.deepEqual(
      helpers.collectionSelections(restored.basket.lines.value),
      sent.selections
    )
    await restored.checkout.submit()
    assert.deepEqual(restored.requests[1].payload, sent)
  } finally {
    restored.scope.stop()
  }
})

test('a recovered receipt arriving after a customer switch cannot populate the new session', async () => {
  const state = checkoutHarness()
  await state.checkout.submit()
  const sent = state.requests[0].payload
  state.scope.stop()
  let resolve
  const response = new Promise((done) => {
    resolve = done
  })
  const restored = checkoutHarness({
    storage: state.storage,
    seed: false,
    responses: [response],
  })
  try {
    restored.currentUser.value = { uid: 'another' }
    resolve({ order: { id: sent.order.id }, state: 'accepted' })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    assert.equal(restored.checkout.submission.value, null)
    assert.equal(restored.basket.count.value, 0)
    assert.equal(restored.checkout.name.value, '')
  } finally {
    restored.scope.stop()
  }
})

test('Collection status copy distinguishes acceptance, preparation and readiness, and refresh only reads the saved order', async () => {
  const state = checkoutHarness()
  try {
    const messages = {
      received: 'Waiting for the kitchen to accept your order.',
      accepted:
        'The kitchen has accepted your order. We’ll update you when it’s ready.',
      preparing: 'The kitchen is preparing your order.',
      ready: 'Your order is ready to collect.',
      completed: 'Thank you. Your order has been completed.',
      declined: 'The kitchen could not accept your order.',
    }
    for (const [status, message] of Object.entries(messages)) {
      state.checkout.submission.value = {
        order: { id: 'receipt' },
        state: status,
      }
      assert.equal(state.checkout.responseMessage.value, message)
    }
    state.responses.push({ order: { id: 'receipt' }, state: 'ready' })
    await state.checkout.refresh()
    assert.equal(state.checkout.submission.value.state, 'ready')
    assert.deepEqual(state.requests, [
      { path: '/api/ordering/response', payload: { orderId: 'receipt' } },
    ])
  } finally {
    state.scope.stop()
  }
})
