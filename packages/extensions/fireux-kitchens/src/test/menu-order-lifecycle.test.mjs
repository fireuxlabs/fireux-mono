import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue, watch, effectScope, nextTick } from 'vue'

function load(name, dependencies) {
  const source = readFileSync(
    new URL(`../runtime/menu/composables/order/${name}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function tracking() {
  const state = {
    sentOrder: ref(null),
    status: ref(null),
    capabilityToken: ref(''),
    fulfilmentLabel: ref(''),
    paymentLabel: ref(''),
    receiptItems: ref([]),
    save() {},
    restore() {
      return false
    },
    isAcknowledged() {
      return false
    },
    trackCreated(order) {
      state.sentOrder.value = order
    },
    resetMemory() {
      state.sentOrder.value = null
      state.status.value = null
    },
    acknowledge() {
      state.resetMemory()
    },
  }
  return state
}
const errorMessage = (error) => error.message
const created = {
  id: 'order-a',
  kitchen_service_id: 'lunch',
  order_type: 'collection',
  status: 'pending',
  order_number: 'A1',
}

async function lifecycle(fetch) {
  const active = effectScope()
  const scopeKey = ref('kitchen:food')
  const currentUser = ref(null)
  const hasAuthState = ref(false)
  const stored = tracking()
  const live = { data: ref(null), error: ref(null), refresh: async () => {} }
  const browser = { location: { href: '' } }
  let mount,
    unmount,
    restores = 0,
    requestKeys = 0
  const create = load('useMenuOrderLifecycle', {
    computed,
    ref,
    toValue,
    watch,
    onMounted: (fn) => {
      mount = fn
    },
    onBeforeUnmount: (fn) => {
      unmount = fn
    },
    useAuth: () => ({ currentUser, hasAuthState }),
    useRoute: () => ({ query: {} }),
    useMenuOrderTrackingSession: () => stored,
    useLiveAsyncData: () => live,
    useMenuOrderCustomerRecovery: () => ({
      amendmentLines: ref([]),
      recovery: ref({}),
      resetTransientState() {},
      restoreOrder() {
        restores += 1
      },
    }),
    menuOrderAccessHeaders: async () => ({}),
    createMenuOrderRequestKey: () => `key-${++requestKeys}`,
    createdMenuOrderTrackingStatus: (order) => order,
    createdMenuOrderBasketLines: (items) => items,
    customerOrderRequestError: errorMessage,
    isTransientCustomerOrderRequestFailure: () => false,
    $fetch: fetch,
    window: browser,
  })
  const state = active.run(() =>
    create({
      scopeKey,
      kitchenId: 'kitchen',
      kitchenServiceId: 'lunch',
      sourceMenuId: 'food',
      menuId: 'food',
      orderType: 'collection',
      fulfilmentLabel: () => 'Collect',
    })
  )
  mount()
  await nextTick()
  return {
    state,
    stored,
    scopeKey,
    currentUser,
    hasAuthState,
    live,
    browser,
    restores: () => restores,
    stop() {
      unmount()
      active.stop()
    },
  }
}
const submission = {
  body: { items: [{ id: 'dish', quantity: 1 }] },
  fulfilmentLabel: 'Collect',
  paymentLabel: 'Pay later',
}

test('restoration runs once at mount, once for settled Auth, and once per scope change', async () => {
  const app = await lifecycle(async () => created)
  try {
    assert.equal(app.restores(), 1)
    app.currentUser.value = { uid: 'user' }
    app.hasAuthState.value = true
    await nextTick()
    assert.equal(app.restores(), 2)
    app.scopeKey.value = 'kitchen:drinks'
    await nextTick()
    assert.equal(app.restores(), 3)
  } finally {
    app.stop()
  }
})

test('a failed request retries with the same idempotency key; a changed basket gets a new key', async () => {
  const keys = []
  const app = await lifecycle(async (_url, options) => {
    keys.push(options.body.idempotency_key)
    throw new Error('Temporary failure')
  })
  try {
    await app.state.submit(submission)
    await app.state.submit(submission)
    await app.state.submit({ ...submission, body: { items: [] } })
    assert.deepEqual(keys, ['key-1', 'key-1', 'key-2'])
  } finally {
    app.stop()
  }
})

test('late submission cannot populate tracking after navigating to another Menu', async () => {
  const response = deferred()
  const app = await lifecycle(() => response.promise)
  try {
    const pending = app.state.submit(submission)
    await nextTick()
    app.scopeKey.value = 'kitchen:drinks'
    await nextTick()
    response.resolve(created)
    assert.equal(await pending, null)
    assert.equal(app.stored.sentOrder.value, null)
    assert.equal(app.state.pending.value, false)
  } finally {
    app.stop()
  }
})

test('a created order is tracked before its required online checkout opens', async () => {
  const calls = []
  let app
  app = await lifecycle(async (url) => {
    calls.push(url)
    if (url.endsWith('/checkout-session')) {
      assert.equal(app.stored.sentOrder.value.id, created.id)
      return { url: 'https://checkout.example.test/order-a' }
    }
    return { ...created, payment: { required: true, status: 'pending' } }
  })
  try {
    await app.state.submit(submission)
    assert.deepEqual(calls, [
      '/api/menus/food/orders',
      '/api/menus/food/orders/order-a/checkout-session',
    ])
    assert.equal(
      app.browser.location.href,
      'https://checkout.example.test/order-a'
    )
  } finally {
    app.stop()
  }
})

test('a late checkout cannot redirect after leaving its Menu', async () => {
  const checkout = deferred()
  const requested = deferred()
  const app = await lifecycle(async (url) => {
    if (url.endsWith('/checkout-session')) {
      requested.resolve()
      return checkout.promise
    }
    return { ...created, payment: { required: true, status: 'pending' } }
  })
  try {
    const pending = app.state.submit(submission)
    await requested.promise
    app.scopeKey.value = 'kitchen:drinks'
    await nextTick()
    checkout.resolve({ url: 'https://checkout.example.test/order-a' })
    assert.equal(await pending, null)
    assert.equal(app.browser.location.href, '')
  } finally {
    app.stop()
  }
})

test('a live update for another order is ignored', async () => {
  const app = await lifecycle(async () => created)
  try {
    app.stored.sentOrder.value = created
    app.live.data.value = { ...created, id: 'other-order' }
    await nextTick()
    assert.equal(app.stored.status.value, null)
    app.live.data.value = { ...created, status: 'accepted' }
    await nextTick()
    assert.equal(app.stored.status.value.status, 'accepted')
  } finally {
    app.stop()
  }
})

function recovery(fetch, requestedOrderId = '') {
  const scopeKey = ref('kitchen:food')
  const currentUser = ref({ uid: 'user', getIdToken: async () => 'test-token' })
  const stored = tracking()
  let retries = 0,
    refreshes = 0
  const create = load('useMenuOrderCustomerRecovery', {
    ref,
    toValue,
    $fetch: fetch,
    customerOrderRequestError: errorMessage,
    isTerminalMenuOrderStatus: (status) => status === 'completed',
    isTransientCustomerOrderRequestFailure: () => true,
    menuOrderWaitingFor: () => 'kitchen',
    recoveredMenuOrderBasketLines: () => [],
    setTimeout: () => {
      retries += 1
      return 1
    },
    clearTimeout() {},
  })
  const state = create({
    currentUser,
    scopeKey,
    kitchenId: 'kitchen',
    kitchenServiceId: 'lunch',
    sourceMenuId: 'food',
    orderType: 'collection',
    tracking: stored,
    requestedOrderId,
    fulfilmentLabel: () => 'Collect',
    refreshStatus: async () => {
      refreshes += 1
    },
  })
  return {
    state,
    scopeKey,
    stored,
    retries: () => retries,
    refreshes: () => refreshes,
  }
}

test('late recovery errors cannot change a different Menu or schedule a retry', async () => {
  const response = deferred()
  const app = recovery(() => response.promise)
  const pending = app.state.restoreOrder()
  await nextTick()
  app.scopeKey.value = 'kitchen:drinks'
  app.state.resetTransientState()
  response.reject(new Error('Offline'))
  await pending
  assert.deepEqual(app.state.recovery.value, { phase: 'idle' })
  assert.equal(app.retries(), 0)
})

test('only the latest recovery attempt can restore an order', async () => {
  const responses = [deferred(), deferred()]
  let calls = 0
  const app = recovery(() => responses[calls++].promise)
  const first = app.state.restoreOrder()
  await nextTick()
  const second = app.state.restoreOrder()
  await nextTick()
  const order = { ...created, kitchen: { id: 'kitchen' }, menu: { id: 'food' } }
  responses[1].resolve({ items: [order] })
  await second
  responses[0].resolve({ items: [{ ...order, id: 'old-order' }] })
  await first
  assert.equal(app.stored.sentOrder.value.id, created.id)
  assert.equal(app.refreshes(), 1)
})

test('live order status from another named service is ignored', async () => {
  const app = await lifecycle(async () => created)
  try {
    app.stored.sentOrder.value = created
    app.live.data.value = {
      ...created,
      kitchen_service_id: 'dinner',
      status: 'accepted',
    }
    await nextTick()
    assert.equal(app.stored.status.value, null)
  } finally {
    app.stop()
  }
})

test('recovery does not restore another service or assign service identity to historical orders', async () => {
  for (const kitchen_service_id of ['dinner', undefined]) {
    const order = {
      ...created,
      kitchen_service_id,
      kitchen: { id: 'kitchen' },
      menu: { id: 'food' },
    }
    const app = recovery(async () => ({ items: [order] }))
    await app.state.restoreOrder()
    assert.equal(app.stored.sentOrder.value, null)
    assert.equal(app.state.recovery.value.phase, 'no-match')
  }
})

test('confirmation-first request is tracked without opening online checkout or preselecting payment', async () => {
  const calls = []
  const app = await lifecycle(async (url) => {
    calls.push(url)
    return {
      ...created,
      status: 'pending_acceptance',
      payment: {
        flow: 'confirmation_first',
        required: false,
        status: 'not_required',
      },
    }
  })
  try {
    await app.state.submit(submission)
    assert.deepEqual(calls, ['/api/menus/food/orders'])
    assert.equal(app.browser.location.href, '')
    assert.equal(
      app.stored.paymentLabel.value,
      'Choose after Kitchen confirmation'
    )
  } finally {
    app.stop()
  }
})

test('an explicit customer return selects only its exact order and never substitutes another order', async () => {
  const row = {
    ...created,
    status: 'awaiting_payment_choice',
    kitchen: { id: 'kitchen' },
    menu: { id: 'food' },
  }
  const app = recovery(
    async () => ({ items: [row, { ...row, id: 'wanted' }] }),
    'wanted'
  )
  await app.state.restoreOrder()
  assert.equal(app.stored.sentOrder.value.id, 'wanted')
  const missing = recovery(async () => ({ items: [row] }), 'not-owned')
  await missing.state.restoreOrder()
  assert.equal(missing.stored.sentOrder.value, null)
  assert.equal(
    missing.state.recovery.value.phase,
    'requested-order-unavailable'
  )
})
