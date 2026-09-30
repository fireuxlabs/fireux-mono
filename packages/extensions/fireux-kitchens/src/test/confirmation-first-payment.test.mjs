import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { load } from './kitchen/kiosk-test-helpers.mjs'
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const lifecycle = load(
  '../../runtime/kitchen/models/order-lifecycle.model.ts',
  'isKitchenOrderPaymentSatisfied,kitchenOrderTransitionRule,isKitchenOrderStatus,isKitchenOrderType,isKitchenOrderPostPaymentStatus,resolveKitchenOrderPostPaymentStatus'
)
const { buildKitchenOrderTransitionPatch: transition } = load(
  '../../runtime/kitchen/server/operations/orders/transition.ts',
  'buildKitchenOrderTransitionPatch',
  { ...lifecycle, createError, Timestamp: { fromMillis: (x) => x } }
)
const payment = load(
  '../../runtime/menu/server/ordering/payment.ts',
  'resolveMenuOrderPayment,statusAfterPayment',
  {
    ...lifecycle,
    createError,
    text: (x) => String(x || '').trim(),
    menuOrderTypeStrategy: () => ({ resolvesDelivery: false }),
  }
)
const choices = load(
  '../../runtime/menu/server/ordering/payment-choice.ts',
  'buildOrderPaymentChoice,orderPaymentChoices,orderPaymentReleaseStatus',
  { ...payment, createError }
)
const fixture = (mode = 'queue') => ({
  id: 'order-a',
  kitchen_id: 'kitchen-a',
  menu_id: 'menu-a',
  kitchen_service_id: 'pickup',
  order_type: 'collection',
  status: 'pending_acceptance',
  collection: { mode },
  created: { app_id: 'app-a' },
  customer: {},
  payment: {
    flow: 'confirmation_first',
    status: 'not_required',
    required: false,
    currency_code: 'CHF',
  },
  fulfilment_policy: { payment_methods: ['cash', 'online_card'] },
  pricing: {
    minor_unit_digits: 2,
    subtotal: { amount_minor: 3600, currency_code: 'CHF' },
    total: { amount_minor: 3600, currency_code: 'CHF' },
  },
})
const accept = (order) => ({ ...order, ...transition(order, 'accept') })

test('server preparation and later transitions reject the same unsettled payment states', () => {
  for (const [status, action] of [
    ['awaiting_preparation', 'start_preparation'],
    ['scheduled', 'start_preparation'],
    ['accepted', 'mark_ready'],
    ['ready', 'return_to_queue'],
    ['ready', 'complete'],
  ]) {
    for (const required of [false, true]) {
      for (const paymentStatus of ['not_required', 'paid', 'pending', 'requires_payment', 'failed', 'cancelled', 'refunded', undefined]) {
        for (const method of ['pay_later', undefined]) {
          const order = { ...fixture(), status, payment: { flow: 'confirmation_first', required, status: paymentStatus, method } }
          const satisfied = Boolean(method) && paymentStatus === (required ? 'paid' : 'not_required')
          if (satisfied) assert.ok(transition(order, action).status)
          else assert.throws(() => transition(order, action), /payment choice or successful payment/)
        }
      }
    }
  }
})

test('all new order types require confirmation then choice; historical orders retain their flow', () => {
  for (const type of [
    'collection',
    'delivery',
    'pre_order',
    'eat_in',
    'takeaway',
    'dine_in',
    'room_service',
  ]) {
    const order = { ...fixture(), order_type: type }
    assert.throws(
      () => choices.buildOrderPaymentChoice(order, 'pay_later', false),
      /confirmation/
    )
    assert.equal(accept(order).status, 'awaiting_payment_choice')
    for (const state of [
      'pending_acceptance',
      'awaiting_payment_choice',
      'pending_payment',
    ])
      for (const action of [
        'start_preparation',
        'mark_ready',
        'complete',
        'return_to_queue',
      ])
        assert.throws(() => transition({ ...order, status: state }, action))
  }
  const old = fixture('scheduled')
  delete old.payment.flow
  assert.equal(accept(old).status, 'accepted')
  assert.throws(
    () => choices.buildOrderPaymentChoice(old, 'pay_later', false),
    /original/
  )
})

test('pay-later stays unpaid; scheduled and ASAP require explicit preparation after payment choice', () => {
  for (const mode of ['queue', 'scheduled']) {
    const confirmed = accept(fixture(mode))
    const patch = choices.buildOrderPaymentChoice(confirmed, 'pay_later', false)
    const chosen = { ...confirmed, ...patch }
    assert.equal(
      chosen.status,
      mode === 'scheduled' ? 'scheduled' : 'awaiting_preparation'
    )
    assert.equal(chosen.payment.status, 'not_required')
    assert.equal(chosen.payment.required, false)
    assert.equal(chosen.payment.method, 'pay_later')
    assert.equal(chosen.payment.paid_at, undefined)
    assert.deepEqual(
      choices.buildOrderPaymentChoice(chosen, 'pay_later', false),
      {}
    )
    assert.deepEqual(transition(chosen, 'accept'), {})
    assert.throws(() => transition(chosen, 'mark_ready'))
    assert.equal(transition(chosen, 'start_preparation').status, 'accepted')
  }
})

test('unavailable online methods are hidden and rejected; chosen online payment holds preparation', () => {
  const order = accept(fixture())
  assert.deepEqual(choices.orderPaymentChoices(order, false), [
    'cash',
    'pay_later',
  ])
  assert.throws(
    () => choices.buildOrderPaymentChoice(order, 'online_card', false),
    /available/
  )
  assert.throws(
    () => choices.buildOrderPaymentChoice(order, 'invented', true),
    /available/
  )
  const online = {
    ...order,
    ...choices.buildOrderPaymentChoice(order, 'online_card', true),
  }
  assert.equal(online.status, 'pending_payment')
  assert.equal(online.payment.amount_chf, 36)
  for (const status of ['requires_payment', 'pending', 'failed', 'cancelled']) {
    assert.throws(() =>
      transition(
        { ...online, payment: { ...online.payment, status } },
        'start_preparation'
      )
    )
  }
  assert.deepEqual(
    choices.buildOrderPaymentChoice(online, 'online_card', true),
    {}
  )
  assert.throws(
    () =>
      choices.buildOrderPaymentChoice(
        {
          ...online,
          payment: { ...online.payment, stripe_checkout_session_id: 'cs_a' },
        },
        'pay_later',
        true
      ),
    /Close/
  )
  assert.equal(
    choices.buildOrderPaymentChoice(
      { ...online, payment: { ...online.payment, status: 'failed' } },
      'pay_later',
      true
    ).status,
    'awaiting_preparation'
  )
})

test('rejection cannot be paid or prepared and acceptance retries do not regress advanced orders', () => {
  const order = fixture()
  const rejected = {
    ...order,
    ...transition(order, 'reject', { note: 'Unavailable' }),
  }
  assert.equal(rejected.status, 'changes_requested')
  assert.throws(() =>
    choices.buildOrderPaymentChoice(rejected, 'pay_later', false)
  )
  assert.throws(() => transition(rejected, 'start_preparation'))
  for (const status of [
    'pending_payment',
    'scheduled',
    'awaiting_preparation',
    'accepted',
    'ready',
    'completed',
  ])
    assert.deepEqual(transition({ ...order, status }, 'accept'), {})
})

function endpoint(path, deps) {
  const source = readFileSync(
    new URL('../runtime/' + path, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(
      'export default defineEventHandler',
      'const handler = defineEventHandler'
    )
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return handler`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function webhookHarness(
  order,
  eventType = 'checkout.session.completed',
  overrides = {}
) {
  let current = structuredClone(order),
    writes = 0
  const session = {
    id: 'cs_a',
    payment_status: 'paid',
    amount_total: 3600,
    currency: 'chf',
    metadata: {
      flow: 'kitchen_order_payment',
      appId: 'app-a',
      kitchenId: 'kitchen-a',
      menuId: 'menu-a',
      orderId: 'order-a',
    },
    ...overrides,
  }
  const handler = endpoint('server/api/menus/payments/stripe-webhook.post.ts', {
    ...lifecycle,
    ...payment,
    createError,
    defineEventHandler: (fn) => fn,
    getHeader: () => 'signature',
    readRawBody: async () => 'signed-body',
    process: { env: { STRIPE_WEBHOOK_SECRET: 'test-only' } },
    getMenuStripe: () => ({
      webhooks: {
        constructEvent: () => ({ type: eventType, data: { object: session } }),
      },
    }),
    allowUnsignedStripeWebhook: () => false,
    FieldValue: { serverTimestamp: () => 'verified-time' },
    serverKitchenOrdersTarget: (kitchen) => {
      assert.equal(kitchen, 'kitchen-a')
      return kitchen
    },
    runGuardedServerTransaction: async (_, fn) =>
      fn({
        read: async (_, id) => {
          assert.equal(id, 'order-a')
          return { exists: true, data: current }
        },
        update: (_, id, patch) => {
          current = { ...current, ...patch }
          writes++
        },
      }),
    dispatchPreOrderWhatsApp: async () => {
      throw new Error('Unexpected notification')
    },
    console: { warn() {} },
  })
  return {
    handler,
    session,
    get order() {
      return current
    },
    get writes() {
      return writes
    },
  }
}
const pendingOnline = (mode) => {
  const order = accept(fixture(mode))
  const chosen = {
    ...order,
    ...choices.buildOrderPaymentChoice(order, 'online_card', true),
  }
  chosen.payment.stripe_checkout_session_id = 'cs_a'
  return chosen
}

test('verified payment releases only preparation eligibility; duplicate callbacks do not regress preparation', async () => {
  for (const mode of ['queue', 'scheduled']) {
    const h = webhookHarness(pendingOnline(mode))
    await h.handler({})
    assert.equal(
      h.order.status,
      mode === 'scheduled' ? 'scheduled' : 'awaiting_preparation'
    )
    assert.equal(h.order.payment.status, 'paid')
    assert.equal(h.order.payment.paid_at, 'verified-time')
    assert.equal(transition(h.order, 'start_preparation').status, 'accepted')
    await h.handler({})
    assert.equal(h.writes, 1)
  }
  const advanced = pendingOnline()
  advanced.status = 'accepted'
  advanced.payment.status = 'paid'
  const h = webhookHarness(advanced)
  await h.handler({})
  assert.equal(h.writes, 0)
})

test('unpaid, wrong amount/currency/session/menu/app callbacks cannot release an order', async () => {
  for (const override of [
    { payment_status: 'unpaid' },
    { amount_total: 1 },
    { currency: 'eur' },
    { id: 'cs_wrong' },
  ]) {
    const h = webhookHarness(pendingOnline(), undefined, override)
    await h.handler({})
    assert.equal(h.writes, 0)
  }
  for (const field of ['appId', 'menuId']) {
    const h = webhookHarness(pendingOnline())
    h.session.metadata[field] = 'wrong'
    await h.handler({})
    assert.equal(h.writes, 0)
  }
  const before = pendingOnline()
  before.status = 'pending_acceptance'
  const h = webhookHarness(before)
  await h.handler({})
  assert.equal(h.writes, 0)
})

test('failed/expired payments remain waiting; late failures after success and stale callbacks after method change do nothing', async () => {
  for (const event of [
    'checkout.session.expired',
    'checkout.session.async_payment_failed',
  ]) {
    const h = webhookHarness(pendingOnline(), event)
    await h.handler({})
    assert.equal(h.order.status, 'pending_payment')
    assert.equal(h.order.payment.status, 'failed')
    assert.throws(() => transition(h.order, 'start_preparation'))
    const paid = pendingOnline()
    paid.payment.status = 'paid'
    paid.status = 'awaiting_preparation'
    const late = webhookHarness(paid, event)
    await late.handler({})
    assert.equal(late.writes, 0)
  }
  const switched = accept(fixture())
  Object.assign(
    switched,
    choices.buildOrderPaymentChoice(switched, 'pay_later', false)
  )
  const stale = webhookHarness(switched)
  await stale.handler({})
  assert.equal(stale.writes, 0)
})

const accessSource = readFileSync(
  new URL(
    '../runtime/menu/server/ordering/order-capability.ts',
    import.meta.url
  ),
  'utf8'
).split('export function requireMenuOrderCustomerAccess')[1]
const requireMenuOrderCustomerAccess = compileFunction(
  `${stripTypeScriptTypes('function requireMenuOrderCustomerAccess' + accessSource)}; return requireMenuOrderCustomerAccess`,
  ['createError', 'matchesMenuOrderCapability', 'text']
)(
  createError,
  (token, hash) => token === 'guest-secret' && hash === 'fixture-hash',
  (x) => String(x || '').trim()
)
function choiceHarness(
  order,
  access = { customerUid: 'customer-a', capabilityToken: '' },
  options = {}
) {
  let current = structuredClone({
      ...order,
      customer_uid: 'customer-a',
      customer_capability_hash: 'fixture-hash',
    }),
    writes = 0
  const calls = []
  const handler = endpoint(
    'server/api/menus/[menuId]/orders/[orderId]/payment-choice.post.ts',
    {
      ...choices,
      requireMenuOrderCustomerAccess,
      createError,
      defineEventHandler: (fn) => fn,
      setCorsHeaders() {},
      MENU_ORDER_CAPABILITY_HEADER: 'x-order-capability',
      requirePathSegment: (x) => x,
      getRouterParam: (_, key) => (key === 'menuId' ? 'menu-a' : 'order-a'),
      getQuery: () => ({}),
      readBody: async (event) => event,
      readMenuOrderContext: async () => ({
        appId: 'app-a',
        kitchenId: 'kitchen-a',
        menuId: 'menu-a',
        ...options.context,
      }),
      readMenuOrderCustomerAccess: async () => access,
      getRuntimeFirestore: () => ({
        doc: (path) => {
          calls.push(path)
          return {
            get: async () => ({
              exists: true,
              data: () => structuredClone(current),
            }),
          }
        },
      }),
      serverKitchenOrdersTarget: (kitchen) => {
        assert.equal(kitchen, 'kitchen-a')
        return kitchen
      },
      FieldValue: { serverTimestamp: () => 'choice-time' },
      menuOnlinePaymentAvailable: () => true,
      getMenuStripe: () => ({
        checkout: {
          sessions: {
            retrieve: async (id) => {
              calls.push(`retrieve:${id}`)
              return {
                id,
                status: options.sessionStatus || 'open',
                payment_status: 'unpaid',
              }
            },
            expire: async (id) => {
              calls.push(`expire:${id}`)
              return { id, status: 'expired' }
            },
          },
        },
      }),
      runGuardedServerTransaction: async (_, fn) =>
        fn({
          read: async () => ({ exists: true, data: structuredClone(current) }),
          update: (_, id, patch) => {
            assert.equal(id, 'order-a')
            current = { ...current, ...patch }
            writes++
          },
        }),
    }
  )
  return {
    handler,
    calls,
    get order() {
      return current
    },
    get writes() {
      return writes
    },
  }
}

test('trusted choice command enforces customer, menu, App scope and confirmation before writing', async () => {
  for (const access of [
    { customerUid: 'other', capabilityToken: '' },
    { customerUid: '', capabilityToken: 'wrong' },
  ]) {
    const h = choiceHarness(accept(fixture()), access)
    await assert.rejects(h.handler({ method: 'pay_later' }), /not found/)
    assert.equal(h.writes, 0)
  }
  for (const change of [
    { menu_id: 'other' },
    { kitchen_id: 'other' },
    { created: { app_id: 'other' } },
  ]) {
    const h = choiceHarness({ ...accept(fixture()), ...change })
    await assert.rejects(h.handler({ method: 'pay_later' }), /not found/)
    assert.equal(h.writes, 0)
  }
  const pending = choiceHarness(fixture())
  await assert.rejects(pending.handler({ method: 'pay_later' }), /confirmation/)
  assert.equal(pending.writes, 0)
  const guest = choiceHarness(accept(fixture()), {
    customerUid: '',
    capabilityToken: 'guest-secret',
  })
  await guest.handler({ method: 'pay_later' })
  await guest.handler({ method: 'pay_later' })
  assert.equal(guest.writes, 1)
  assert.equal(guest.order.payment.status, 'not_required')
  assert.ok(
    guest.calls.every((path) => path === 'kitchens/kitchen-a/orders/order-a')
  )
})

test('changing away from online payment verifies checkout expiry before releasing preparation', async () => {
  const h = choiceHarness(pendingOnline())
  await h.handler({ method: 'pay_later' })
  assert.deepEqual(h.calls.slice(1), ['retrieve:cs_a', 'expire:cs_a'])
  assert.equal(h.order.status, 'awaiting_preparation')
  assert.equal(h.order.payment.status, 'not_required')
  assert.equal(h.order.payment.stripe_checkout_session_id, undefined)
  const complete = choiceHarness(pendingOnline(), undefined, {
    sessionStatus: 'complete',
  })
  await assert.rejects(complete.handler({ method: 'pay_later' }), /completing/)
  assert.equal(complete.writes, 0)
})

test('in-app acceptance notification retries after failure and is idempotent without promising email', async () => {
  const { createHash } = await import('node:crypto')
  let stored,
    writes = 0,
    fail = true
  const { publishAcceptedOrderCustomerNotification: notify } = load(
    '../../runtime/kitchen/server/operations/orders/customer-notification.ts',
    'publishAcceptedOrderCustomerNotification',
    {
      createHash,
      Timestamp: { now: () => 'notification-time' },
      serverIdentityUserNotificationsTarget: (uid) => {
        assert.equal(uid, 'customer-a')
        return uid
      },
      runGuardedServerTransaction: async (_, fn) => {
        if (fail) throw new Error('transport unavailable')
        return fn({
          read: async () => ({ exists: Boolean(stored) }),
          create: (_, id, value) => {
            assert.match(id, /^kitchen-order-accepted-/)
            stored = value
            writes++
          },
        })
      },
    }
  )
  const input = {
    appId: 'app-a',
    kitchenId: 'kitchen-a',
    orderId: 'order-a',
    orderNumber: 'A1',
    orderType: 'collection',
    customerUid: 'customer-a',
    paymentChoiceRequired: true,
  }
  await assert.rejects(notify(input), /unavailable/)
  fail = false
  await notify(input)
  await notify(input)
  assert.equal(writes, 1)
  assert.match(stored.message, /My orders to choose how to pay/)
  assert.doesNotMatch(stored.message, /email|SMS|sent/i)
})

function checkoutHarness(order) {
  let current = structuredClone(order),
    providerCalls = 0
  const h = endpoint(
    'server/api/menus/[menuId]/orders/[orderId]/checkout-session.post.ts',
    {
      ...lifecycle,
      ...payment,
      createError,
      defineEventHandler: (fn) => fn,
      setCorsHeaders() {},
      MENU_ORDER_CAPABILITY_HEADER: 'x-order-capability',
      getRouterParam: (_, key) => (key === 'menuId' ? 'menu-a' : 'order-a'),
      getQuery: () => ({}),
      getRequestURL: () => new URL('https://example.test/'),
      process: { env: {} },
      readMenuOrderContext: async () => ({
        appId: 'app-a',
        kitchenId: 'kitchen-a',
        menuId: 'menu-a',
        currencyCode: 'CHF',
        routeMenuId: 'food',
        routeScope: { kind: 'root' },
      }),
      readMenuOrderCustomerAccess: async () => ({}),
      requireMenuOrderCustomerAccess: () => ({}),
      getRuntimeFirestore: () => ({
        doc: () => ({
          get: async () => ({ exists: true, data: () => current }),
        }),
      }),
      menuOnlinePaymentAvailable: () => true,
      menuRoutePath: () => '/menus/food.collection?service=pickup',
      menuChoiceContextForOrderType: () => 'collection',
      createHash: () => ({
        update() {
          return this
        },
        digest: () => 'fixture-key',
      }),
      getMenuStripe: () => ({
        checkout: {
          sessions: {
            create: async () => {
              providerCalls++
              return {
                id: 'cs_new',
                url: 'https://checkout.example.test/fixture',
              }
            },
            retrieve: async (id) => ({
              id,
              status: 'open',
              url: 'https://checkout.example.test/fixture',
            }),
          },
        },
      }),
      FieldValue: { serverTimestamp: () => 'checkout-time' },
      serverKitchenOrdersTarget: () => 'orders',
      runGuardedServerTransaction: async (_, fn) =>
        fn({
          read: async () => ({ exists: true, data: structuredClone(current) }),
          update: (_, id, patch) => {
            current = { ...current, ...patch }
          },
        }),
    }
  )
  return {
    handler: h,
    get order() {
      return current
    },
    get calls() {
      return providerCalls
    },
  }
}

test('checkout trusted boundary refuses pre-confirmation or unchosen payment and reuses an existing session', async () => {
  for (const status of [
    'pending_acceptance',
    'awaiting_payment_choice',
    'scheduled',
    'awaiting_preparation',
  ]) {
    const h = checkoutHarness({ ...pendingOnline(), status })
    await assert.rejects(h.handler({}), /confirmation/)
    assert.equal(h.calls, 0)
  }
  const order = pendingOnline()
  delete order.payment.stripe_checkout_session_id
  const h = checkoutHarness(order)
  await h.handler({})
  await h.handler({})
  assert.equal(h.calls, 1)
  assert.equal(h.order.status, 'pending_payment')
  assert.equal(h.order.payment.status, 'pending')
})

test('customer can cancel an existing changes-requested order; cancellation never opens payment or preparation', async () => {
  let order = {
    ...fixture(),
    channel: 'menu',
    status: 'changes_requested',
    customer_uid: 'customer-a',
  }
  const handler = endpoint(
    'server/api/menus/[menuId]/orders/[orderId]/customer-response.post.ts',
    {
      defineEventHandler: (fn) => fn,
      createError,
      setCorsHeaders() {},
      MENU_ORDER_CAPABILITY_HEADER: 'x-order-capability',
      getRouterParam: (_, key) => (key === 'menuId' ? 'menu-a' : 'order-a'),
      getQuery: () => ({}),
      readBody: async () => ({ action: 'cancel' }),
      readMenuOrderContext: async () => ({
        kitchenId: 'kitchen-a',
        menuId: 'menu-a',
      }),
      readMenuOrderCustomerAccess: async () => ({
        customerUid: 'customer-a',
        capabilityToken: '',
      }),
      requireMenuOrderCustomerAccess,
      FieldValue: { serverTimestamp: () => 'cancel-time' },
      serverKitchenOrdersTarget: () => 'orders',
      runGuardedServerTransaction: async (_, fn) =>
        fn({
          read: async () => ({ exists: true, data: order }),
          update: (_, id, patch) => {
            order = { ...order, ...patch }
          },
        }),
    }
  )
  await handler({})
  assert.equal(order.status, 'cancelled')
  assert.equal(order.payment.status, 'not_required')
  assert.throws(() => choices.buildOrderPaymentChoice(order, 'pay_later', true))
  assert.throws(() => transition(order, 'start_preparation'))
})

test('customer recovery links retain only the existing safe service query', () => {
  const { safeMenuPath } = load(
    '../../runtime/user/server/customer/orders/projection.ts',
    'safeMenuPath',
    lifecycle
  )
  assert.equal(
    safeMenuPath('/menus/food.collection?service=pickup'),
    '/menus/food.collection?service=pickup'
  )
  for (const value of [
    'https://evil.test',
    '//evil.test/path',
    '/menus/food?redirect=https://evil.test',
    '/menus/food#token',
  ])
    assert.equal(safeMenuPath(value), '/menus')
})

test('acceptance commits despite notification failure; retry does not regress state and later preparation suppresses stale notification copy', async () => {
  let order={...fixture(),customer_uid:'customer-a'}, notifications=0, fail=true
  const { executeKitchenOrderAction } = load('../../runtime/kitchen/server/operations/orders/actions.ts', 'executeKitchenOrderAction', {
    ...lifecycle, isKitchenOrderTransition:()=>true, buildKitchenOrderTransitionPatch:transition,
    defineEventHandler:fn=>fn,createError,readBody:async event=>event,requirePathSegment:x=>x,
    requireKitchenOperator:async(_,scope)=>{assert.deepEqual(scope,{appId:'app-a',kitchenId:'kitchen-a'});return 'operator-a'},
    serverKitchenOrdersTarget:()=> 'orders',serverKitchenSalesTarget:()=> 'sales',serverAppFinancialFactsTarget:()=> 'facts',FieldValue:{serverTimestamp:()=> 'accepted-time'},
    runGuardedServerTransaction:async(_,fn)=>fn({read:async()=>({exists:true,data:order}),update:(_,id,patch)=>{order={...order,...patch}}}),
    publishAcceptedOrderCustomerNotification:async input=>{notifications++;assert.equal(input.paymentChoiceRequired,true);if(fail)throw new Error('notification unavailable')},
    console:{error(){}},
  })
  const handler = endpoint('server/api/workspace/kitchen/orders/transition.post.ts', { defineEventHandler: fn => fn, readBody: async event => event, executeKitchenOrderAction })
  const body={app_id:'app-a',kitchen_id:'kitchen-a',order_id:'order-a',transition:'accept'}
  await handler(body);assert.equal(order.status,'awaiting_payment_choice')
  fail=false;await handler(body);assert.equal(order.status,'awaiting_payment_choice');assert.equal(notifications,2)
  Object.assign(order,choices.buildOrderPaymentChoice(order,'pay_later',false));Object.assign(order,transition(order,'start_preparation'))
  await handler(body);assert.equal(order.status,'accepted');assert.equal(notifications,2)
})
