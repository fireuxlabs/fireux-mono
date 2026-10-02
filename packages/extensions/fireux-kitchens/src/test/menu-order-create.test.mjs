import assert from 'node:assert/strict'
import test from 'node:test'
import { load } from './kitchen/kiosk-test-helpers.mjs'

function fixture({
  key = '',
  replay = null,
  channel = 'menu',
  failCommit = false,
} = {}) {
  const calls = []
  const response = {
    id: 'order',
    order_type: 'pre_order',
    status: 'pending_acceptance',
  }
  const context = {
    appId: 'app',
    kitchenId: 'kitchen',
    menuId: 'menu',
    currencyCode: 'CHF',
  }
  const deps = {
    createError: (x) => Object.assign(new Error(x.statusMessage), x),
    text: (x) => String(x ?? '').trim(),
    readRequestedMenuOrderItems: (body) => body?.items || [],
    readMenuOrderIdempotencyKey: () => key,
    readMenuOrderContext: async (_id, _slug, onResolved) => {
      onResolved({ kind: 'directory-menu' })
      return context
    },
    prepareMenuOrderContextGuard: async () => async () => {
      calls.push('context-guard')
    },
    menuOrderReadSet: () => ({
      observer: {},
      validate: async () => {
        calls.push('pricing-guard')
      },
    }),
    requireKitchenWriterAccount: async () => {
      calls.push('operator-recheck')
    },
    validateMenuOrderSchedule: () => {
      calls.push('schedule-recheck')
    },
    readKitchenMenuOrdering: () => ({}),
    readMenuOrderSelection: () => ({ channel, kitchenServiceId: 'pickup' }),
    requireKitchenKioskSession: async () => {
      calls.push('kiosk-auth')
      return { kioskId: 'device' }
    },
    firebaseBearerUser: async () => ({ uid: 'customer' }),
    requireKitchenOperator: async () => {
      calls.push('operator-auth')
      return 'operator'
    },
    prepareMenuOrderCommand: (input) => {
      calls.push(['command', input.actorId, input.customerUid])
      return input
    },
    menuOrderIdempotencyRequest: (input) => input,
    getRuntimeFirestore: () => ({}),
    readMenuOrderIdempotentResponse: async () => replay,
    resolveMenuOrderItems: async () => {
      calls.push('price')
      return { subtotal: 13, items: ['line'] }
    },
    resolveMenuOrderFulfilment: async () => {
      calls.push('fulfilment')
      return {}
    },
    createMenuOrderRecordIdentity: () => ({}),
    assembleMenuOrderRecord: () => ({
      id: 'order',
      path: 'orders/order',
      payload: {},
      response,
    }),
    menuOrderReservationResponse: (x) => x,
    commitMenuOrderIdempotently: async (input) => {
      await input.validateBeforeCreate({})
      calls.push('idempotent-commit')
      if (failCommit) throw new Error('commit failed')
      return { response }
    },
    commitKitchenOrderWithServiceSequence: async (input) => {
      await input.validateBeforeCreate({})
      calls.push('commit')
      if (failCommit) throw new Error('commit failed')
      return response
    },
    dispatchPreOrderWhatsApp: async () => {
      calls.push('notify')
      throw new Error('private provider/customer data')
    },
    console: { warn: (message) => calls.push(['warning', message]) },
  }
  return {
    ...load(
      '../../runtime/menu/server/ordering/create.ts',
      'createMenuOrder',
      deps
    ),
    calls,
    response,
  }
}
const input = { menuId: 'food', kitchenSlug: 'baeren', body: { items: [{}] } }

test('committed ordinary and idempotent orders retain success when notification fails', async () => {
  for (const key of ['', 'request']) {
    const f = fixture({ key })
    assert.equal(await f.createMenuOrder({}, input), f.response)
    assert.ok(
      f.calls.indexOf(key ? 'idempotent-commit' : 'commit') <
        f.calls.indexOf('notify')
    )
    assert.equal(
      JSON.stringify(f.calls).includes('private provider/customer data'),
      false
    )
  }
})
test('replay retries notification without pricing, fulfilment or a second commit', async () => {
  const replay = { id: 'original', order_type: 'pre_order' }
  const f = fixture({ key: 'request', replay })
  assert.equal(await f.createMenuOrder({}, input), replay)
  assert.equal(f.calls.includes('price'), false)
  assert.equal(f.calls.includes('commit'), false)
  assert.equal(f.calls.includes('idempotent-commit'), false)
})
test('commit failure remains a failure and cannot dispatch notification', async () => {
  const f = fixture({ failCommit: true })
  await assert.rejects(f.createMenuOrder({}, input), /commit failed/)
  assert.equal(f.calls.includes('notify'), false)
})
test('existing channel authority and customer identity reach the command unchanged', async () => {
  for (const [channel, actor, customer] of [
    ['menu', 'menu', 'customer'],
    ['staff_pos', 'operator', undefined],
    ['kiosk', 'kiosk:device', undefined],
  ]) {
    const f = fixture({ channel })
    await f.createMenuOrder({}, input)
    assert.deepEqual(
      f.calls.find((x) => Array.isArray(x) && x[0] === 'command'),
      ['command', actor, customer]
    )
  }
})
