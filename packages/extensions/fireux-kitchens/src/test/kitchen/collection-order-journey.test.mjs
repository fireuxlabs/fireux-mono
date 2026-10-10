import { isFirestoreDocumentId } from '../../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

// Controlled integration: actual request/record/numbering/replay/payment/action/Sale
// owners, with an in-memory transactional store. Resolved published catalogue,
// prices, schedule validation and authentication transport are fixture boundaries.
// No Firebase, provider, browser mutation or real payment is executed.
function load(path, names, deps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export (?:type )?\{[\s\S]*?\} from ['"][^'"]+['"]\n/gm, '')
    .replace(
      /export default define(?:EventHandler|LiveReadHandler)/g,
      'const handler = defineEventHandler'
    )
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const lifecycle = load(
  '../../runtime/kitchen/models/order-lifecycle.model.ts',
  'isKitchenOrderStatus,isKitchenOrderType,isKitchenOrderChannel,isKitchenOrderTransition,isKitchenOrderPaymentSatisfied,kitchenOrderTransitionRule,resolveKitchenOrderPostPaymentStatus,canPrintKitchenOrderTicket'
)
const strategy = load(
  '../../runtime/menu/server/ordering/order-type.ts',
  'menuOrderTypeStrategy,menuOrderTypeStrategiesList'
)
const request = load(
  '../../runtime/menu/server/ordering/order-request.ts',
  'text,numberValue,orderId,orderNumber,normalizeOrderType,normalizePaymentMethod,readCustomer',
  { createError, ...strategy }
)
const lines = load(
  '../../runtime/menu/server/ordering/lines.ts',
  'readRequestedMenuOrderItems',
  { createError }
)
const destination = load(
  '../../runtime/menu/server/ordering/order-destination.ts',
  'readMenuOrderDestination',
  { createError, ...request }
)
const payment = load(
  '../../runtime/menu/server/ordering/payment.ts',
  'resolveMenuOrderPayment,validateKitchenOrderDepositPolicy',
  {
    createError,
    text: request.text,
    normalizePaymentMethod: request.normalizePaymentMethod,
    ...strategy,
    ...lifecycle,
  }
)
const command = load(
  '../../runtime/menu/server/ordering/order-command.ts',
  'readMenuOrderSelection,prepareMenuOrderCommand,menuOrderIdempotencyRequest',
  {
    createError,
    ...request,
    ...strategy,
    ...destination,
    ...payment,
    isMenuOrderingEnabled: (value) =>
      value.enabled && value.order_types.length > 0,
    readMenuOrderChannel: () => 'menu',
    tableChannelEnabled: () => true,
  }
)
const choice = load(
  '../../runtime/menu/server/ordering/payment-choice.ts',
  'buildOrderPaymentChoice,orderPaymentChoices,requireMenuOrderPaymentAvailability',
  { createError, ...payment }
)
const money = load(
  '../../../../../extensions/fireux-finance/src/runtime/utils/money.ts',
  'financialMoneyFromDecimal,financialCurrencyMinorUnitDigits,requireFinancialMoney,requireFinancialMinorAmount,addFinancialMoney,multiplyFinancialMoney'
)
const pricing = load(
  '../../runtime/kitchen/server/orders/pricing.ts',
  'createKitchenOrderPricing,requireKitchenOrderPricing',
  money
)
const fact = load(
  '../../../../../extensions/fireux-finance/src/runtime/server/finance/financial-fact.ts',
  'buildFinancialFact,financialFactPath',
  { createHash, ...money, FinancialFactSchemaVersion: 1 }
)
const salePath = load(
  '../../runtime/kitchen/utils/sale.ts',
  'kitchenSalePath,KitchenSaleSchemaVersion'
)
const sale = load(
  '../../runtime/kitchen/server/orders/sale.ts',
  'buildCompletedKitchenOrderSale,KitchenSaleInvariantError',
  {
    isFirestoreDocumentId,
    ...money,
    ...pricing,
    ...fact,
    ...salePath,
    ...lifecycle,
  }
)
const capabilityProtocol = load(
  '../../runtime/menu/utils/menu-order-capability.ts',
  'readMenuOrderCapabilityToken,MENU_ORDER_CAPABILITY_HEADER'
)
const capability = load(
  '../../runtime/menu/server/ordering/order-capability-token.ts',
  'createMenuOrderCapability,matchesMenuOrderCapability',
  { createHash, randomBytes, timingSafeEqual, ...capabilityProtocol }
)
const access = load(
  '../../runtime/menu/server/ordering/order-capability.ts',
  'requireMenuOrderCustomerAccess',
  { createError, ...capability }
)
const documentIds = load(
  '../../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts',
  'isFirestoreDocumentId'
)
const numberingProjection = load(
  '../../runtime/kitchen/utils/order-numbering.ts',
  'applyKitchenOrderNumbering,applyKitchenOrderNumberingToResponse'
)
class FixtureTimestamp {
  constructor(millis) {
    this.millis = millis
    this.seconds = Math.floor(millis / 1000)
  }
  toMillis() {
    return this.millis
  }
  toDate() {
    return new Date(this.millis)
  }
}
const copy = (value) =>
  value instanceof FixtureTimestamp
    ? value
    : Array.isArray(value)
      ? value.map(copy)
      : value && typeof value === 'object'
        ? Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, copy(v)])
          )
        : value

function journey({
  mode = 'queue',
  operatorAppId = 'pilot-app',
  methods = ['cash'],
  onlineAvailable = false,
} = {}) {
  const context = {
    appId: 'pilot-app',
    kitchenId: 'pilot-kitchen',
    menuId: 'pilot-menu',
    currencyCode: 'CHF',
    kitchenName: 'LOCAL CONTROLLED PILOT',
    menuData: { name: 'Reviewed fixture menu' },
    routeMenuId: 'food',
    routeScope: { kind: 'directory', kitchenSlug: 'local-pilot' },
  }
  const orderPath = (id) => `kitchens/${context.kitchenId}/orders/${id}`
  const records = new Map(),
    commits = [],
    notifications = []
  let authorized = true,
    failure = '',
    published = true,
    online = onlineAvailable,
    losePaymentAtCommit = false,
    revokeAtCommit = false
  const targets = {
    serverKitchenOrdersTarget: (id) => ({
      collectionPath: `kitchens/${id}/orders`,
    }),
    serverKitchenOrderNumberingTarget: (id) => ({
      collectionPath: `kitchens/${id}/order-service`,
    }),
    serverKitchenOrderIdempotencyTarget: (id) => ({
      collectionPath: `kitchens/${id}/order-idempotency`,
    }),
    serverUserOrdersTarget: (id) => ({ collectionPath: `users/${id}/orders` }),
    serverKitchenSalesTarget: (id) => ({
      collectionPath: `kitchens/${id}/sales`,
    }),
    serverAppFinancialFactsTarget: (id) => ({
      collectionPath: `apps/${id}/financial-facts`,
    }),
  }
  const timestamp = (millis) => new FixtureTimestamp(millis)
  const db = {
    doc: (path) => ({
      get: async () => ({
        exists: records.has(path),
        data: () => copy(records.get(path)),
      }),
    }),
    collection: (path) => ({ doc: (id) => db.doc(`${path}/${id}`) }),
  }
  const runGuardedServerTransaction = async (_scope, callback) => {
    if (revokeAtCommit) authorized = false
    const writes = [],
      tx = {
        read: async (target, id) => {
          const path = `${target.collectionPath}/${id}`
          return { exists: records.has(path), data: copy(records.get(path)) }
        },
        create: (target, id, value) =>
          writes.push({
            kind: 'create',
            path: `${target.collectionPath}/${id}`,
            value: copy(value),
          }),
        update: (target, id, value) =>
          writes.push({
            kind: 'update',
            path: `${target.collectionPath}/${id}`,
            value: copy(value),
          }),
      }
    const result = await callback(tx)
    const next = new Map(records)
    for (const write of writes) {
      if (failure && write.path.includes(failure))
        throw new Error('Controlled storage failure')
      if (write.kind === 'create' && next.has(write.path))
        throw new Error('Document already exists')
      if (write.kind === 'update' && !next.has(write.path))
        throw new Error('Document missing')
      const value =
        write.kind === 'update'
          ? { ...next.get(write.path), ...write.value }
          : write.value
      if (write.kind === 'create') delete value.id // Match guarded create identity stripping.
      next.set(write.path, value)
    }
    records.clear()
    for (const entry of next) records.set(...entry)
    commits.push(...writes)
    return result
  }
  const base = {
    createError,
    ...targets,
    ...numberingProjection,
    createHash,
    runGuardedServerTransaction,
    Timestamp: { now: () => timestamp(Date.now()), fromMillis: timestamp },
    FieldValue: { serverTimestamp: () => timestamp(Date.now()) },
    requirePathSegment: (value) => {
      if (!value || value.includes('/')) throw new Error('Invalid path')
      return value
    },
    requireFirestoreDocumentId: (value) => {
      if (!documentIds.isFirestoreDocumentId(value))
        throw new Error('Order App id is invalid')
      return value
    },
    requireKitchenOperator: async () => {
      if (!authorized) throw new Error('Operator denied')
      return 'pilot-operator'
    },
    requireKitchenWriterAccount: async () => {
      if (!authorized) throw new Error('Membership revoked')
    },
  }
  const numbered = load(
    '../../runtime/kitchen/server/orders/order-numbering.ts',
    'nextKitchenOrderNumber,commitKitchenOrderWithNumbering',
    base
  )
  const replay = load(
    '../../runtime/menu/server/ordering/idempotency.ts',
    'readMenuOrderIdempotencyKey,readMenuOrderIdempotentResponse,commitMenuOrderIdempotently,menuOrderReservationResponse',
    { ...base, ...numbered }
  )
  const assembly = load(
    '../../runtime/menu/server/ordering/order-record.ts',
    'assembleMenuOrderRecord,createMenuOrderRecordIdentity',
    {
      ...base,
      ...pricing,
      ...strategy,
      ...request,
      ...capability,
      readRecordString: (record, key) => record[key] || '',
      menuRoutePath: () =>
        '/kitchens/local-pilot/menus/food.collection?offering=collection',
    }
  )
  const ordering = {
    enabled: true,
    order_types: [
      {
        type: 'collection',
        kitchen_offering_id: 'collection',
        kitchen_offering_name: 'Collection',
        offering_hours: {
          operation_hours: {
            windows: [{ day: 1, open: '00:00', close: '23:59' }],
          },
        },
        fulfilment: { payment_methods: methods },
      },
    ],
  }
  const fulfilment = load(
    '../../runtime/menu/server/ordering/order-fulfilment.ts',
    'resolveMenuOrderFulfilment',
    {
      ...request,
      ...strategy,
      createError,
      validateMenuOrderSchedule: () => {},
    }
  )
  const create = load(
    '../../runtime/menu/server/ordering/create.ts',
    'createMenuOrder',
    {
      ...base,
      ...request,
      ...lines,
      ...command,
      ...numbered,
      ...replay,
      ...assembly,
      ...fulfilment,
      ...choice,
      menuOnlinePaymentAvailable: () => online,
      readMenuOrderContext: async (_id, _slug, resolved) => {
        resolved?.({ kind: 'controlled-published-menu' })
        return context
      },
      readKitchenMenuOrdering: () => ordering,
      firebaseBearerUser: async () => ({ uid: 'pilot-customer' }),
      getRuntimeFirestore: () => db,
      prepareMenuOrderContextGuard: async () => async () => {
        if (!published) throw new Error('Menu withdrawn')
        if (losePaymentAtCommit) online = false
      },
      menuOrderReadSet: () => ({ observer: {}, validate: async () => {} }),
      validateMenuOrderSchedule: () => {},
      resolveMenuOrderItems: async (_db, { requestedItems }) => ({
        subtotal: 18 * requestedItems[0].quantity,
        items: [
          {
            id: 'line-a',
            source_item_id: 'item-a',
            menu_id: context.menuId,
            dish_id: 'dish-a',
            label: 'LOCAL SIMULATION Pizza',
            quantity: requestedItems[0].quantity,
            unit_price: 18,
          },
        ],
      }),
    }
  ).createMenuOrder
  const transition = load(
    '../../runtime/kitchen/server/orders/transition.ts',
    'buildKitchenOrderTransitionPatch,readKitchenOrderEstimatedMinutes',
    { ...base, ...lifecycle }
  )
  const action = load(
    '../../runtime/kitchen/server/orders/actions.ts',
    'executeKitchenOrderAction',
    {
      ...base,
      ...transition,
      ...lifecycle,
      ...sale,
      publishAcceptedOrderCustomerNotification: async (input) =>
        notifications.push(input),
    }
  ).executeKitchenOrderAction
  const http = {
    ...base,
    ...choice,
    ...lifecycle,
    ...access,
    ...capabilityProtocol,
    getRuntimeFirestore: () => db,
    defineEventHandler: (fn) => fn,
    getRouterParam: (event, key) =>
      key === 'menuId' ? context.menuId : event.orderId,
    getQuery: () => ({}),
    readBody: async (event) => event.body,
    readMenuOrderContext: async () => context,
    readMenuOrderCustomerAccess: async (event) => ({
      capabilityToken: event.token || '',
      customerUid: '',
    }),
    menuOnlinePaymentAvailable: () => online,
    setCorsHeaders: () => {},
  }
  const paymentCommand = load(
    '../../runtime/menu/server/ordering/payment-choice-command.ts',
    'executeMenuOrderPaymentChoice',
    http
  )
  const choose = load(
    '../../runtime/server/api/menus/[menuId]/orders/[orderId]/payment-choice.post.ts',
    'handler',
    { ...http, ...paymentCommand }
  ).handler
  const status = load(
    '../../runtime/server/api/menus/[menuId]/orders/[orderId].get.ts',
    'handler',
    http
  ).handler
  const common = load(
    '../../runtime/kitchen/server/finance/gross-sales-report-common.ts',
    'KITCHEN_GROSS_SALES_REPORT_MAX_LINES_PER_SALE,KITCHEN_GROSS_SALES_REPORT_MAX_LINES,KITCHEN_GROSS_SALES_REPORT_MAX_SALES,KITCHEN_GROSS_SALES_REPORT_MAX_ITEM_GROUPS,KitchenGrossSalesReportInvariantError,invariantError,itemKey,limitError,optionalText,record,requirePositiveSafeInteger,requireReportMinorAmount,requiredId,requiredText,addCount,money',
    { ...money, ...documentIds }
  )
  const reportSale = load(
    '../../runtime/kitchen/server/finance/gross-sales-report-sale.ts',
    'validateSale',
    {
      ...common,
      ...money,
      ...pricing,
      ...lifecycle,
      ...salePath,
      Timestamp: FixtureTimestamp,
    }
  )
  const accumulator = load(
    '../../runtime/kitchen/server/finance/gross-sales-report-accumulator.ts',
    'buildCurrencySummary,buildDailySummaries,createCurrencyAccumulator,addSaleToCurrency',
    common
  )
  const reconcile = load(
    '../../runtime/kitchen/server/finance/gross-sales-report-reconcile.ts',
    'reconcileDailySummaries',
    common
  )
  const aggregate = load(
    '../../runtime/kitchen/server/finance/gross-sales-report-aggregate.ts',
    'aggregateKitchenGrossSalesReport',
    {
      ...common,
      ...accumulator,
      ...reconcile,
      ...reportSale,
      requireCanonicalTimezone: (value) => {
        assert.equal(value, 'UTC')
        return value
      },
      localDateFormatter: () =>
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
      formatLocalDate: (date, formatter) => formatter.format(date),
    }
  )
  const range = {
    from: '2020-01-01T00:00:00Z',
    to: '2030-01-01T00:00:00Z',
    fromDate: new Date('2020-01-01'),
    toDate: new Date('2030-01-01'),
  }
  const reportSelection = () => ({ range, timezone: 'UTC', now: new Date() })
  const reportDb = {
    collection: (path) => ({
      doc: (id) => ({ path: `${path}/${id}` }),
      where() {
        return this
      },
      orderBy() {
        return this
      },
      limit() {
        return this
      },
      async get() {
        return {
          docs: [...records]
            .filter(([key]) => key.startsWith(path + '/'))
            .map(([key, value]) => ({
              id: key.split('/').at(-1),
              data: () => copy(value),
            })),
        }
      },
    }),
    getAll: async () => [],
  }
  const readReport = load(
    '../../runtime/kitchen/server/finance/gross-sales-report-read.ts',
    'readKitchenGrossSalesReport',
    {
      ...common,
      ...aggregate,
      requireKitchenGrossSalesReportLocalDateRange: reportSelection,
      requireKitchenGrossSalesReportPeriodRange: reportSelection,
      requireKitchenGrossSalesReportPresetRange: reportSelection,
    }
  ).readKitchenGrossSalesReport
  const body = {
    idempotency_key: 'controlled-pilot-request-0001',
    kitchen_offering_id: 'collection',
    order_type: 'collection',
    items: [{ item_id: 'item-a', quantity: 2 }],
    customer: { name: 'LOCAL SIMULATION — DO NOT PREPARE' },
    collection:
      mode === 'scheduled'
        ? { mode, requested_for: new Date(Date.now() + 3600000).toISOString() }
        : { mode },
  }
  let response
  return {
    records,
    commits,
    notifications,
    context,
    orderPath,
    submit: async () =>
      (response = await create(
        {},
        { menuId: context.menuId, kitchenSlug: 'local-pilot', body }
      )),
    act: (transition) =>
      action(
        {},
        {
          app_id: operatorAppId,
          kitchen_id: context.kitchenId,
          order_id: response.id,
          transition,
        }
      ),
    choose: (method = 'pay_later', token = response.capability_token) =>
      choose({ orderId: response.id, token, body: { method } }),
    status: (token = response.capability_token) =>
      status({ orderId: response.id, token }),
    report: () =>
      readReport({
        db: reportDb,
        appId: operatorAppId,
        kitchenId: context.kitchenId,
        timezone: 'UTC',
      }),
    order: () => records.get(orderPath(response.id)),
    fail: (path) => {
      failure = path
    },
    revoke: () => {
      authorized = false
    },
    withdraw: () => {
      published = false
    },
    online: (value) => {
      online = value
    },
    losePaymentAtCommit: () => {
      losePaymentAtCommit = true
    },
    revokeAtCommit: () => {
      revokeAtCommit = true
    },
  }
}

for (const mode of ['queue', 'scheduled'])
  test(`controlled ${mode} collection: request → confirmation → unpaid choice → preparation → pickup → one Sale`, async () => {
    const h = journey({ mode }),
      first = await h.submit(),
      writeCount = h.commits.length
    assert.equal(first.status, 'pending_acceptance')
    assert.equal(first.receipt.total_chf, 36)
    assert.equal(first.order_number, '1')
    assert.equal(h.order().pricing.total.amount_minor, 3600)
    assert.equal(h.order().customer_capability_hash.length, 64)
    assert.equal('capability_token' in h.order(), false)
    assert.equal('id' in h.order(), false)
    assert.equal((await h.submit()).id, first.id)
    assert.equal(h.commits.length, writeCount)
    assert.equal((await h.status()).status, 'pending_acceptance')
    assert.equal(lifecycle.canPrintKitchenOrderTicket(h.order()), false)
    await assert.rejects(h.choose(), /confirmation/)
    await h.act('accept')
    assert.equal((await h.status()).status, 'awaiting_payment_choice')
    assert.equal(lifecycle.canPrintKitchenOrderTicket(h.order()), false)
    await assert.rejects(h.act('start_preparation'), /payment choice/)
    await h.choose()
    assert.equal(
      h.order().status,
      mode === 'scheduled' ? 'scheduled' : 'awaiting_preparation'
    )
    assert.equal(h.order().payment.status, 'not_required')
    assert.equal(h.order().payment.paid_at, undefined)
    await h.act('start_preparation')
    assert.equal(h.order().status, 'accepted')
    assert.equal(lifecycle.canPrintKitchenOrderTicket(h.order()), true)
    await h.act('mark_ready')
    assert.equal((await h.status()).status, 'ready')
    await h.act('complete')
    assert.equal((await h.status()).status, 'completed')
    assert.equal(h.order().payment.status, 'not_required')
    const sales = [...h.records].filter(([path]) => path.includes('/sales/')),
      facts = [...h.records].filter(([path]) =>
        path.includes('/financial-facts/')
      )
    assert.equal(sales.length, 1)
    assert.equal(facts.length, 1)
    assert.equal(sales[0][1].pricing.total.amount_minor, 3600)
    assert.equal(facts[0][1].amount_minor, 3600)
    assert.equal(facts[0][1].source.path, sales[0][0])
    const report = await h.report()
    assert.equal(report.sale_count, 1)
    assert.equal(report.currencies[0].gross_sales.amount_minor, 3600)
    assert.equal(report.transactions[0].source.id, first.id)
    assert.equal(h.notifications.length, 1)
    assert.equal(h.notifications[0].appId, h.context.appId)
    const before = h.commits.length
    await assert.rejects(h.act('complete'), /Cannot complete/)
    assert.equal(h.commits.length, before)
  })
async function ready(h) {
  await h.submit()
  await h.act('accept')
  await h.choose()
  await h.act('start_preparation')
  await h.act('mark_ready')
}
test('failed completion storage leaves Ready and no Sale/fact; retry commits all three together', async () => {
  const h = journey()
  await ready(h)
  h.fail('/financial-facts/')
  const before = h.commits.length
  await assert.rejects(h.act('complete'), /storage failure/)
  assert.equal(h.order().status, 'ready')
  assert.equal(h.commits.length, before)
  assert.equal(
    [...h.records.keys()].some((path) => path.includes('/sales/')),
    false
  )
  h.fail('')
  await h.act('complete')
  assert.equal(h.order().status, 'completed')
})
test('wrong customer capability cannot read status or select payment; unavailable online choice cannot release preparation', async () => {
  const h = journey()
  await h.submit()
  await h.act('accept')
  const before = h.commits.length
  await assert.rejects(h.status('x'.repeat(43)), /not found/)
  await assert.rejects(h.choose('pay_later', 'x'.repeat(43)), /not found/)
  await assert.rejects(h.choose('online_card'), /available payment/)
  assert.equal(h.order().status, 'awaiting_payment_choice')
  assert.equal(h.commits.length, before)
})
test('withdrawn fixture publication prevents Order, link, reservation and counter writes', async () => {
  const h = journey()
  h.withdraw()
  await assert.rejects(h.submit(), /withdrawn/)
  assert.equal(h.records.size, 0)
  assert.equal(h.commits.length, 0)
})
test('invalid immutable Sale snapshot or revoked operator cannot complete an order', async () => {
  const h = journey()
  await ready(h)
  h.order().items[0].quantity = 3
  const before = h.commits.length
  await assert.rejects(h.act('complete'), /canonical Order subtotal/)
  assert.equal(h.order().status, 'ready')
  assert.equal(h.commits.length, before)
  h.order().items[0].quantity = 2
  h.revoke()
  await assert.rejects(h.act('complete'), /Operator denied/)
  assert.equal(h.order().status, 'ready')
  assert.equal(h.commits.length, before)
})

for (const methods of [[], ['online_card']])
  test(`unusable payment policy ${JSON.stringify(methods)} rejects creation without writes`, async () => {
    const h = journey({ methods })
    await assert.rejects(h.submit(), /payment method is available/)
    assert.equal(h.records.size, 0)
    assert.equal(h.commits.length, 0)
  })
test('Main App operator completes tenant-origin Order while Sale, fact and customer notification retain source App', async () => {
  const h = journey({ operatorAppId: 'main-app' })
  await ready(h)
  const result = await h.act('complete')
  assert.equal(result.app_id, 'main-app')
  assert.equal(h.order().created.app_id, 'pilot-app')
  assert.equal(h.order().status, 'completed')
  const sale = [...h.records].find(([path]) => path.includes('/sales/'))[1]
  const [factPath, fact] = [...h.records].find(([path]) =>
    path.includes('/financial-facts/')
  )
  assert.equal(sale.app_id, 'pilot-app')
  assert.equal(fact.app_id, 'pilot-app')
  assert.ok(factPath.startsWith('apps/pilot-app/'))
  assert.equal(h.notifications[0].appId, 'pilot-app')
  assert.equal(sale.actor.id, 'pilot-operator')
  const report = await h.report()
  assert.equal(report.app_id, 'main-app')
  assert.equal(report.sale_count, 1)
  assert.equal(report.currencies[0].gross_sales.amount_minor, 3600)
})

test('Kitchen report accepts mixed source Apps, but rejects wrong Kitchen and malformed source identity', async () => {
  const h = journey({ operatorAppId: 'main-app' })
  await ready(h)
  await h.act('complete')
  const [path, original] = [...h.records].find(([path]) =>
    path.includes('/sales/')
  )
  const second = copy(original)
  second.app_id = 'second-tenant'
  second.order_id = 'second-order'
  h.records.set(path.replace(/[^/]+$/, 'second-order'), second)
  const report = await h.report()
  assert.equal(report.sale_count, 2)
  assert.equal(report.currencies[0].gross_sales.amount_minor, 7200)
  second.kitchen_id = 'different-kitchen'
  await assert.rejects(h.report(), /identity or scope/)
  second.kitchen_id = h.context.kitchenId
  for (const appId of ['bad/app', '..', '__name__']) {
    second.app_id = appId
    await assert.rejects(h.report(), /source App id/)
  }
})

test('online availability disappearing before commit rejects creation; committed replay still returns its original response', async () => {
  const waiting = journey({ methods: ['online_card'], onlineAvailable: true })
  waiting.losePaymentAtCommit()
  await assert.rejects(waiting.submit(), /payment method is available/)
  assert.equal(waiting.records.size, 0)
  assert.equal(waiting.commits.length, 0)
  const committed = journey({ methods: ['online_card'], onlineAvailable: true })
  const first = await committed.submit(),
    before = committed.commits.length
  committed.online(false)
  const replay = await committed.submit()
  assert.equal(replay.id, first.id)
  assert.equal(committed.commits.length, before)
})
test('membership revocation after operator preflight prevents completion writes', async () => {
  const h = journey()
  await ready(h)
  const before = h.commits.length
  h.revokeAtCommit()
  await assert.rejects(h.act('complete'), /Membership revoked/)
  assert.equal(h.order().status, 'ready')
  assert.equal(h.commits.length, before)
  assert.equal(
    [...h.records.keys()].some((path) => path.includes('/sales/')),
    false
  )
})

test('malformed saved source App cannot receive acceptance or financial writes', async () => {
  for (const appId of ['bad/app', '..', '__name__']) {
    const h = journey()
    await h.submit()
    h.order().created.app_id = appId
    const before = h.commits.length
    await assert.rejects(h.act('accept'), /Order App id is invalid/)
    assert.equal(h.order().status, 'pending_acceptance')
    assert.equal(h.commits.length, before)
    assert.equal(h.notifications.length, 0)
  }
})
