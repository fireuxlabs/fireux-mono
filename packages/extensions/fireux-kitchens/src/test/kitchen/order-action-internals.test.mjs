import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash } from 'node:crypto'
import { isFirestoreDocumentId } from '../../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts'

function load(path, names, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export (?:type )?\{[\s\S]*?\} from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const ids = load(
  '../../../../../core/fireux-core/src/runtime/server/utils/ids/path.ts',
  'requireFirestoreDocumentId',
  {
    createError,
    isFirestoreDocumentId,
    readString: (value) => (typeof value === 'string' ? value.trim() : ''),
  }
)
const lifecycle = load(
  '../../runtime/kitchen/models/order-lifecycle.model.ts',
  'isKitchenOrderTransition,isKitchenOrderStatus,kitchenOrderTransitionRule,isKitchenOrderPaymentSatisfied,isKitchenOrderType,isKitchenOrderChannel'
)
const transition = load(
  '../../runtime/kitchen/server/orders/transition.ts',
  'buildKitchenOrderTransitionPatch,readKitchenOrderEstimatedMinutes',
  {
    createError,
    ...lifecycle,
    Timestamp: { fromMillis: (value) => value },
  }
)
const deferred = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}
const input = (extra) => ({
  app_id: 'acting-app',
  kitchen_id: 'kitchen-a',
  order_id: 'order-a',
  transition: 'accept',
  ...extra,
})
function harness({
  gate,
  retry,
  storedKitchen = 'kitchen-a',
  status = 'pending_acceptance',
  revoke = false,
} = {}) {
  const writes = [],
    patches = [],
    notifications = []
  let actors = 0,
    transactions = 0,
    authorityChecks = 0,
    reads = 0
  const dependencies = {
    createError,
    ...ids,
    ...lifecycle,
    ...transition,
    FieldValue: { serverTimestamp: () => 'timestamp' },
    serverKitchenOrdersTarget: (kitchenId) => ({
      collectionPath: `kitchens/${kitchenId}/orders`,
    }),
    serverKitchenSalesTarget: (kitchenId) => ({
      collectionPath: `kitchens/${kitchenId}/sales`,
    }),
    serverAppFinancialFactsTarget: (appId) => ({
      collectionPath: `apps/${appId}/financial-facts`,
    }),
    requireKitchenOperator: async (_event, scope) => {
      actors++
      assert.deepEqual(scope, { appId: 'acting-app', kitchenId: 'kitchen-a' })
      if (gate) await gate.promise
      return 'operator'
    },
    requireKitchenWriterAccount: async () => {
      authorityChecks++
      if (revoke)
        throw createError({
          statusCode: 403,
          statusMessage: 'Membership revoked',
        })
    },
    runGuardedServerTransaction: async (_scope, callback) => {
      transactions++
      const run = () =>
        callback({
          read: async (target) => {
            reads++
            assert.equal(target.collectionPath, 'kitchens/kitchen-a/orders')
            return {
              exists: true,
              data: {
                kitchen_id: storedKitchen,
                created: { app_id: 'source-app' },
                status,
                customer_uid: 'customer',
                order_type: 'collection',
              },
            }
          },
          create: (target, id, value) => writes.push({ target, id, value }),
          update: (target, id, value) => {
            patches.push({ target, id, value })
            writes.push({ target, id, value })
          },
        })
      if (retry) {
        await run()
        writes.length = 0
        retry()
      }
      return run()
    },
    publishAcceptedOrderCustomerNotification: async (value) =>
      notifications.push(value),
  }
  const action = load(
    '../../runtime/kitchen/server/orders/actions.ts',
    'executeKitchenOrderAction',
    dependencies
  ).executeKitchenOrderAction
  return {
    action,
    writes,
    patches,
    notifications,
    actors: () => actors,
    transactions: () => transactions,
    authorityChecks: () => authorityChecks,
    reads: () => reads,
  }
}

test('invalid envelopes, IDs, authored estimates and notes fail before authority or transactions', async () => {
  const invalid = [
    null,
    [],
    'accept',
    {},
    input({ status: 'accepted' }),
    input({ app_id: '..' }),
    input({ kitchen_id: '__reserved__' }),
    input({ order_id: 'a/b' }),
    input({ transition: ['accept'] }),
    ...['15', true, [], {}, NaN, Infinity, -1, 0, 4, 16, 95].map((value) =>
      input({ estimated_minutes: value })
    ),
    ...[null, false, 1, {}, []].map((value) => input({ note: value })),
    input({ transition: 'reject' }),
    input({ transition: 'reject', note: ' ' }),
  ]
  for (const body of invalid) {
    const w = harness()
    await assert.rejects(
      w.action({}, body),
      (error) => error.statusCode === 400
    )
    assert.equal(w.actors(), 0)
    assert.equal(w.transactions(), 0)
    assert.deepEqual(w.writes, [])
  }
})

test('the exact initial action, scope and estimate survive mutable input during an authority wait and retry', async () => {
  const gate = deferred(),
    body = input({ estimated_minutes: 20 })
  const w = harness({
    gate,
    retry: () => {
      body.estimated_minutes = 90
      body.note = 'Retry replacement'
    },
  })
  const pending = w.action({}, body)
  Object.assign(body, {
    app_id: 'replacement-app',
    kitchen_id: 'replacement-kitchen',
    order_id: 'replacement-order',
    transition: 'reject',
    estimated_minutes: 10,
    note: 'Replacement reason',
  })
  gate.resolve()
  const result = await pending
  assert.equal(result.app_id, 'acting-app')
  assert.equal(result.kitchen_id, 'kitchen-a')
  assert.equal(result.order.id, 'order-a')
  assert.equal(result.order.status, 'accepted')
  assert.equal(w.authorityChecks(), 2)
  for (const patch of w.patches) {
    assert.equal(patch.id, 'order-a')
    assert.equal(patch.value.estimated_ready_minutes, 20)
    assert.equal(patch.value.kitchen_note, undefined)
  }
  assert.equal(w.notifications.length, 1)
  assert.equal(w.notifications[0].appId, 'source-app')
})

test('rejection captures the original trimmed reason before an authority wait', async () => {
  const gate = deferred(),
    body = input({ transition: 'reject', note: '  Sold out  ' }),
    w = harness({ gate })
  const pending = w.action({}, body)
  body.note = 'Different'
  gate.resolve()
  await pending
  assert.equal(w.patches[0].value.kitchen_note, 'Sold out')
  assert.equal(w.patches[0].value.status, 'changes_requested')
  assert.deepEqual(w.notifications, [])
})

test('all lifecycle actions reject foreign or missing stored Kitchen ownership without writes', async () => {
  for (const action of [
    'accept',
    'start_preparation',
    'reject',
    'mark_ready',
    'return_to_queue',
    'complete',
    'trash',
  ]) {
    for (const storedKitchen of ['foreign', null]) {
      const w = harness({ storedKitchen })
      await assert.rejects(
        w.action({}, input({ transition: action, note: 'Unavailable' })),
        (error) => error.statusCode === 409 && /belong/.test(error.message)
      )
      assert.deepEqual(w.writes, [])
      assert.deepEqual(w.notifications, [])
    }
  }
})

test('revocation after preflight still prevents reads and mutations', async () => {
  const w = harness({ revoke: true })
  await assert.rejects(w.action({}, input()), /revoked/)
  assert.equal(w.authorityChecks(), 1)
  assert.equal(w.reads(), 0)
  assert.deepEqual(w.writes, [])
  assert.deepEqual(w.notifications, [])
})

test('estimate defaults and no-estimate intent remain explicit; lifecycle helper rejects coercible input', () => {
  assert.equal(transition.readKitchenOrderEstimatedMinutes(undefined), 45)
  assert.equal(transition.readKitchenOrderEstimatedMinutes(null), 0)
  for (const value of [5, 20, 90])
    assert.equal(transition.readKitchenOrderEstimatedMinutes(value), value)
  for (const value of ['20', true, [20], {}, NaN, Infinity, 15.5])
    assert.throws(
      () =>
        transition.buildKitchenOrderTransitionPatch(
          { status: 'pending_acceptance' },
          'accept',
          { estimatedMinutes: value }
        ),
      /Estimated minutes/
    )
  for (const note of [true, {}, ['Unavailable']])
    assert.throws(
      () =>
        transition.buildKitchenOrderTransitionPatch(
          { status: 'pending_acceptance' },
          'reject',
          { note }
        ),
      /reason/
    )
})

const money = load(
  '../../../../../extensions/fireux-finance/src/runtime/utils/money.ts',
  'financialMoneyFromDecimal,financialCurrencyMinorUnitDigits,requireFinancialMoney,addFinancialMoney,multiplyFinancialMoney'
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
const saleInput = () => ({
  appId: 'app',
  kitchenId: 'k',
  orderId: 'o',
  actorId: 'u',
  timestamp: 'now',
  order: {
    id: 'o',
    kitchen_id: 'k',
    menu_id: 'm',
    created: { app_id: 'app' },
    status: 'ready',
    order_number: '1',
    order_type: 'collection',
    channel: 'menu',
    items: [
      {
        id: 'line',
        source_item_id: 'item',
        menu_id: 'm',
        dish_id: 'dish',
        label: 'Soup',
        quantity: 1,
        unit_price: 12,
      },
    ],
    pricing: pricing.createKitchenOrderPricing({
      currencyCode: 'CHF',
      subtotal: 12,
      deliveryFee: 0,
      total: 12,
    }),
  },
})

test('Sale references reuse canonical ID semantics, rejecting reserved and whitespace identifiers', () => {
  assert.equal(sale.buildCompletedKitchenOrderSale(saleInput()).sale.id, 'o')
  for (const id of ['..', '__reserved__', ' invalid ', 'a/b']) {
    for (const field of ['appId', 'kitchenId', 'orderId', 'actorId'])
      assert.throws(
        () =>
          sale.buildCompletedKitchenOrderSale({ ...saleInput(), [field]: id }),
        (error) => error instanceof sale.KitchenSaleInvariantError
      )
    for (const field of [
      'id',
      'source_item_id',
      'menu_id',
      'dish_id',
      'sellable_id',
    ]) {
      const value = saleInput()
      value.order.items[0][field] = id
      assert.throws(
        () => sale.buildCompletedKitchenOrderSale(value),
        (error) => error instanceof sale.KitchenSaleInvariantError
      )
    }
  }
})

test('canonical price and line mismatches still block a Sale rather than inventing a total', () => {
  for (const mutate of [
    (x) => x.order.pricing.total.amount_minor++,
    (x) => (x.order.items[0].quantity = 2),
    (x) => (x.order.items[0].unit_price = '12'),
    (x) => (x.order.pricing.subtotal.currency_code = 'EUR'),
  ]) {
    const value = saleInput()
    mutate(value)
    assert.throws(
      () => sale.buildCompletedKitchenOrderSale(value),
      (error) => error instanceof sale.KitchenSaleInvariantError
    )
  }
})
