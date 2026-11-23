import { itemPricingHelpers } from '../helpers/item-pricing.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { OrderChannels } from '../../types/ordering.ts'
import {
  load,
  normalizeKitchenOfferings,
  kioskService,
} from './offering-test-helpers.mjs'
const tablePolicy = load(
  '../../runtime/kitchen/utils/table-service.ts',
  'tableChannelEnabled'
)
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
const menuServices = load(
  '../../runtime/menu/utils/ordering/availability.ts',
  'kitchenMenuOrdering,publicMenuOrderTypes,publicMenuServiceOpen',
  {
    normalizeKitchenOfferings,
    ...tablePolicy,
    readWeekdayTimeOpenState: timeState.weekdayTimeState.open,
  }
)
const publicOffering = {
  ...kioskService,
  hours_source: 'custom',
  hours: {
    ...kioskService.hours,
    windows: [
      { days: timeCore.weekdayTimeCore.days, open: '00:00', close: '00:00' },
    ],
  },
  interactions: ['collection', 'delivery', 'dine_in'].map((type) => ({
    type,
    enabled: true,
    ...(type === 'dine_in'
      ? { table_channels: { staff_pos: false, table_qr: true } }
      : {}),
  })),
}
const ordering = load(
  '../../runtime/kitchen/utils/ordering.ts',
  'readOrder,requireOrderChannel',
  { OrderChannels }
)
const utils = load(
  '../../runtime/kitchen/utils/order-submission.ts',
  'orderSubmissionIssues,initialOrderSubmissionState,canTransitionOrder,readOrderSubmission',
  ordering
)
const draft = (channel = 'website') => ({
  id: 'order-a',
  number: '',
  channel,
  fulfilment: channel === 'website' ? 'collection' : 'takeaway',
  lines: [
    {
      id: 'pizza',
      item: { name: 'Margherita pizza' },
      quantity: 1,
      unit_code: 'C62',
    },
  ],
  customer: { name: 'Sam', phone: '123' },
  ...(channel === 'pos'
    ? { placed_by: { kind: 'person', id: 'caller', name: 'Alex' } }
    : {}),
})
function harness() {
  const records = new Map()
  let allowed = true,
    uid = 'caller'
  const deps = {
    ...ordering,
    ...utils,
    readItemSellingTerms: itemPricingHelpers.readItemSellingTerms,
    serverKitchenItemsTarget: (id) => ({
      collectionPath: `kitchens/${id}/items`,
    }),
    createHash,
    createError: (v) => Object.assign(new Error(v.statusMessage), v),
    useRuntimeConfig: () => ({
      public: { ordering: { channels: ['pos', 'kiosk', 'website'] } },
    }),
    requireFirestoreDocumentId: (v) => {
      if (typeof v !== 'string' || !v || v.includes('/'))
        throw new Error('Invalid ID')
      return v
    },
    defineFirestoreMutationTarget: (v) => v,
    readKitchenMutationActor: async () => ({ uid, runtimeAppId: 'app' }),
    requireKitchenRecordMutationAuthority: async () => {
      if (!allowed) throw new Error('Denied')
    },
    USER_MUTATION_TARGETS: { runtimeUsers: { collectionPath: 'users' } },
    serverAuditStamp: () => ({ at: 'now' }),
    runGuardedServerTransaction: async (_p, run) => {
      const staged = []
      const result = await run({
        read: async (t, id) => {
          if (t.collectionPath === 'users')
            return { exists: true, data: { display_name: 'Alex' } }
          if (t.collectionPath === 'kitchens')
            return {
              exists: true,
              data: { management: { mode: 'app', app_id: 'app' } },
            }
          const data = records.get(`${t.collectionPath}/${id}`)
          return { exists: !!data, data }
        },
        create: (t, id, data) =>
          staged.push([`${t.collectionPath}/${id}`, data]),
        update: (t, id, data) =>
          staged.push([
            `${t.collectionPath}/${id}`,
            { ...records.get(`${t.collectionPath}/${id}`), ...data },
          ]),
        readAll: async (t, limit, after) =>
          [...records]
            .filter(([key]) => key.startsWith(t.collectionPath + '/'))
            .map(([key, data]) => ({ id: key.split('/').at(-1), data }))
            .sort((a, b) => a.id.localeCompare(b.id))
            .filter((row) => !after || row.id > after)
            .slice(0, limit),
        query: async (t, q) =>
          [...records]
            .filter(
              ([key, v]) =>
                key.startsWith(t.collectionPath + '/') &&
                q.value.includes(v.state)
            )
            .map(([key, data]) => ({ id: key.split('/').at(-1), data })),
      })
      for (const [key, data] of staged) records.set(key, data)
      return result
    },
  }
  const server = load(
    '../../runtime/kitchen/server/orders/submission.ts',
    'submitKitchenOrder,respondToKitchenOrder,listKitchenSubmittedOrders',
    deps
  )
  const request = load(
    '../../runtime/kitchen/server/orders/submit-request.ts',
    'submitKitchenOrderRequest',
    { ...deps, submitKitchenOrder: server.submitKitchenOrder }
  )
  const exchange = load(
    '../../runtime/kitchen/server/orders/exchange-request.ts',
    'respondToKitchenOrderRequest,listKitchenSubmittedOrdersRequest',
    { ...deps, ...server }
  )
  return {
    ...server,
    exchangeService: server,
    respondToKitchenOrder: exchange.respondToKitchenOrderRequest,
    listKitchenSubmittedOrders: exchange.listKitchenSubmittedOrdersRequest,
    submitKitchenOrderService: server.submitKitchenOrder,
    submitKitchenOrder: request.submitKitchenOrderRequest,
    records,
    setAllowed: (v) => (allowed = v),
    setUid: (v) => (uid = v),
  }
}
test('submission completeness and auto acceptance vary by origin', () => {
  assert.deepEqual(utils.orderSubmissionIssues(draft()), [])
  assert.equal(utils.initialOrderSubmissionState(draft()), 'received')
  for (const channel of ['pos', 'kiosk'])
    assert.equal(utils.initialOrderSubmissionState(draft(channel)), 'accepted')
  assert.ok(
    utils.orderSubmissionIssues({ ...draft(), customer: { name: 'Sam' } })
      .length
  )
  assert.ok(
    utils
      .orderSubmissionIssues({ ...draft(), fulfilment: 'delivery' })
      .includes('Delivery address is required.')
  )
  assert.ok(
    utils.orderSubmissionIssues({ ...draft('pos'), placed_by: undefined })
      .length
  )
  assert.ok(utils.orderSubmissionIssues({ ...draft(), lines: [] }).length)
})
test('new orders reject malformed Item references and unsupported commercial selections before writing', async () => {
  const h = harness()
  const path = 'kitchens/k/items/pizza'
  const order = draft()
  order.lines[0].item.id = 'pizza'
  for (const badTerms of [
    { price: '18' },
    { choice_groups: [{ pricing: 'full', options: [{ price: '18' }] }] },
    { price: 18, add_ons: [{ label: 'Cheese', price: '2' }] },
  ]) {
    h.records.set(path, { name: 'Pizza', ...badTerms })
    await assert.rejects(
      h.submitKitchenOrder({}, { kitchenId: 'k', order }),
      /Repair selling terms/
    )
    assert.equal(h.records.size, 1)
  }
  h.records.delete(path)
  await assert.rejects(
    h.submitKitchenOrder({}, { kitchenId: 'k', order }),
    /unavailable Item/
  )
  assert.equal(h.records.size, 0)

  h.records.set(path, { name: 'Pizza', price: 18, currency_code: 'CHF' })
  for (const field of ['variant_id', 'add_ons', 'promotion_id']) {
    const malformed = structuredClone(order)
    malformed.lines[0][field] = 'choice'
    await assert.rejects(
      h.submitKitchenOrder({}, { kitchenId: 'k', order: malformed }),
      /Order line is invalid/
    )
    assert.equal(h.records.size, 1)
  }
  await h.submitKitchenOrder({}, { kitchenId: 'k', order })
  h.records.set(path, { name: 'Pizza', price: '18' })
  const retry = await h.submitKitchenOrder({}, { kitchenId: 'k', order })
  assert.equal(retry.submission.order.number, '1')
})

test('numbering and retry preserve exactly one submitted order', async () => {
  const s = harness(),
    input = { kitchenId: 'kitchen', order: draft() }
  const first = await s.submitKitchenOrder({}, input)
  const repeat = await s.submitKitchenOrder({}, input)
  assert.deepEqual(first, repeat)
  assert.equal(first.submission.order.number, '1')
  assert.equal(s.records.size, 2)
  await assert.rejects(
    s.submitKitchenOrder(
      {},
      {
        ...input,
        order: { ...draft(), customer: { name: 'Other', phone: '123' } },
      }
    ),
    /already been used/
  )
})
test('operator response reaches owner and guards revisions and transitions', async () => {
  const s = harness()
  await s.submitKitchenOrder({}, { kitchenId: 'kitchen', order: draft() })
  const respond = (state, expectedRevision, message = '') =>
    s.respondToKitchenOrder(
      {},
      {
        kitchenId: 'kitchen',
        orderId: 'order-a',
        state,
        expectedRevision,
        message,
        estimate_minutes: 20,
      }
    )
  s.setAllowed(false)
  await assert.rejects(respond('accepted', 1), /Denied/)
  s.setAllowed(true)
  await assert.rejects(respond('ready', 1), /transition/)
  await respond('accepted', 1, 'Accepted by Alex')
  const { submissions: [accepted] } = await s.listKitchenSubmittedOrders({}, 'kitchen')
  assert.equal(accepted.state, 'accepted')
  assert.equal(accepted.estimate_minutes, 20)
  await assert.rejects(respond('preparing', 1), /changed/)
  await respond('preparing', 2)
  await respond('ready', 3)
  await respond('completed', 4)
  assert.equal(
    (await s.listKitchenSubmittedOrders({}, 'kitchen')).submissions[0].state,
    'completed'
  )

})
test('decline requires reason and remains terminal', async () => {
  const s = harness()
  await s.submitKitchenOrder({}, { kitchenId: 'kitchen', order: draft() })
  const input = {
    kitchenId: 'kitchen',
    orderId: 'order-a',
    state: 'declined',
    expectedRevision: 1,
    message: '',
    estimate_minutes: null,
  }
  await assert.rejects(s.respondToKitchenOrder({}, input), /reason/)
  await s.respondToKitchenOrder(
    {},
    { ...input, message: 'Kitchen is at capacity.' }
  )
  const { submissions: [declined] } = await s.listKitchenSubmittedOrders({}, 'kitchen')
  assert.equal(declined.message, 'Kitchen is at capacity.')
  await assert.rejects(
    s.respondToKitchenOrder(
      {},
      { ...input, state: 'accepted', expectedRevision: 2 }
    ),
    /transition/
  )
})
test('staff impersonation and undeclared origins cannot create orders', async () => {
  const s = harness()
  await assert.rejects(
    s.submitKitchenOrder(
      {},
      {
        kitchenId: 'kitchen',
        order: {
          ...draft('pos'),
          placed_by: { kind: 'person', id: 'other', name: 'Alex' },
        },
      }
    ),
    /staff identity/
  )
  await assert.rejects(
    s.submitKitchenOrder({}, { kitchenId: 'kitchen', order: draft('api') })
  )
  assert.equal(s.records.size, 0)
})
test('generic submission requires Kitchen authority and server-assigned numbering', async () => {
  const s = harness()
  s.setAllowed(false)
  await assert.rejects(
    s.submitKitchenOrder({}, { kitchenId: 'kitchen', order: draft() }),
    /Denied/
  )
  s.setAllowed(true)
  await assert.rejects(
    s.submitKitchenOrder(
      {},
      { kitchenId: 'kitchen', order: { ...draft(), number: '99' } }
    ),
    /no number/
  )
  const result = await s.submitKitchenOrder(
    {},
    { kitchenId: 'kitchen', order: draft() }
  )
  assert.equal(result.submission.state, 'received')
})

test('submission has no test mode or test metadata', async () => {
  const s = harness()
  await assert.rejects(
    s.submitKitchenOrder(
      {},
      { kitchenId: 'kitchen', order: draft(), test: true }
    ),
    /input is invalid/
  )
  const result = await s.submitKitchenOrder(
    {},
    { kitchenId: 'kitchen', order: draft() }
  )
  assert.equal('test' in result.submission, false)
  assert.equal(
    [...s.records.values()].some((record) => 'test' in record),
    false
  )
})
test('the board reads every submitted order across internal batches without a 100-order cap', async () => {
  const s = harness()
  const first = await s.submitKitchenOrder(
    {},
    { kitchenId: 'kitchen', order: draft() }
  )
  for (let index = 0; index < 1005; index++) {
    const id = `history-${String(index).padStart(5, '0')}`
    s.records.set(`kitchens/kitchen/submitted-orders/${id}`, {
      ...first.submission,
      order: { ...first.submission.order, id, number: String(index + 2) },
      state: 'completed',
      kitchen_id: 'kitchen',
    })
  }
  const result = await s.listKitchenSubmittedOrders({}, 'kitchen')
  assert.equal(result.submissions.length, 1006)
  assert.equal(
    new Set(result.submissions.map((row) => row.order.id)).size,
    1006
  )
  s.setAllowed(false)
  await assert.rejects(s.listKitchenSubmittedOrders({}, 'kitchen'), /Denied/)
})

test('a service cannot borrow another service’s hours and venue DST is respected', () => {
  const hours = {
    ...publicOffering.hours,
    windows: [{ days: ['wednesday'], open: '11:30', close: '13:30' }],
  }
  const ordering = menuServices.kitchenMenuOrdering(
    [
      {
        ...publicOffering,
        id: 'collection',
        hours,
        interactions: [{ type: 'collection', enabled: true }],
      },
      {
        ...publicOffering,
        id: 'delivery',
        hours: {
          ...hours,
          windows: [{ days: ['wednesday'], open: '18:00', close: '22:00' }],
        },
        interactions: [{ type: 'delivery', enabled: true }],
      },
    ],
    'food'
  )
  assert.equal(
    menuServices.publicMenuServiceOpen(
      ordering,
      'collection',
      new Date('2026-10-14T10:00:00Z')
    ),
    true
  )
  assert.equal(
    menuServices.publicMenuServiceOpen(
      ordering,
      'delivery',
      new Date('2026-10-14T10:00:00Z')
    ),
    false
  )
  assert.equal(
    menuServices.publicMenuServiceOpen(
      ordering,
      'collection',
      new Date('2026-10-28T09:30:00Z')
    ),
    false
  )
  assert.equal(
    menuServices.publicMenuServiceOpen(
      ordering,
      'collection',
      new Date('2026-10-28T10:30:00Z')
    ),
    true
  )
})

test('submission service works with explicit server context and no HTTP event', async () => {
  const s = harness()
  const actor = {
    callerUid: 'caller',
    appId: 'app',
    isTenant: false,
    ordering: { channels: ['website'] },
    operator: { uid: 'caller', runtimeAppId: 'app' },
  }
  const result = await s.submitKitchenOrderService(actor, {
    kitchenId: 'kitchen',
    order: draft(),
  })
  assert.equal(result.submission.order.number, '1')
  assert.equal(result.submission.state, 'received')
  await assert.rejects(
    s.submitKitchenOrderService(
      { ...actor, operator: null },
      { kitchenId: 'kitchen', order: { ...draft(), id: 'another' } }
    ),
    /operator context is required/
  )
})

test('exchange services use explicit operators and keep the staff board current', async () => {
  const s = harness()
  await s.submitKitchenOrder({}, { kitchenId: 'kitchen', order: draft() })
  const operator = { uid: 'caller', runtimeAppId: 'app' }
  const input = { kitchenId: 'kitchen', orderId: 'order-a' }
  await assert.rejects(
    s.exchangeService.listKitchenSubmittedOrders(null, 'kitchen'),
    /operator context/
  )
  const response = await s.exchangeService.respondToKitchenOrder(operator, {
    ...input,
    expectedRevision: 1,
    state: 'accepted',
    message: 'Accepted',
    estimate_minutes: 20,
  })
  assert.equal(response.submission.revision, 2)
  assert.equal(
    (await s.exchangeService.listKitchenSubmittedOrders(operator, 'kitchen'))
      .submissions[0].state,
    'accepted'
  )
})
