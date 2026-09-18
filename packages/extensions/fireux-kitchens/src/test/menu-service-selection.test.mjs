import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(name, exports, dependencies = {}) {
  const source = readFileSync(
    new URL(`../runtime/menu/server/ordering/${name}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${exports} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const text = (value) => String(value ?? '').trim()
const { readMenuOrderSelection, menuOrderIdempotencyRequest } = load(
  'order-command',
  'readMenuOrderSelection, menuOrderIdempotencyRequest',
  {
    createError,
    text,
    isMenuOrderingEnabled: (ordering) => ordering.enabled,
    normalizeOrderType: (type, allowed) => {
      if (!allowed.includes(type)) throw new Error('Choose a valid order type.')
      return type
    },
    readMenuOrderChannel: () => 'menu',
  }
)
const hours = {
  timezone: 'Europe/Zurich',
  windows: [{ days: ['monday'], open: '12:00', close: '14:00' }],
}
const policy = (id, overrides = {}) => ({
  kitchen_service_id: id,
  kitchen_service_name: id,
  type: 'collection',
  service_hours: { operation_hours: hours },
  ...overrides,
})
const ordering = {
  enabled: true,
  order_types: [
    policy('lunch', { notice_hours: 1 }),
    policy('dinner', { notice_hours: 3 }),
  ],
}

test('two services sharing one interaction select exact policy and reject missing or unknown identity', () => {
  const selected = readMenuOrderSelection(
    { kitchen_service_id: 'dinner', order_type: 'collection' },
    ordering
  )
  assert.equal(selected.kitchenServiceId, 'dinner')
  assert.equal(selected.orderTypeConfig.notice_hours, 3)
  for (const kitchen_service_id of ['', 'unknown', ['dinner'], 1]) {
    assert.throws(
      () =>
        readMenuOrderSelection(
          { kitchen_service_id, order_type: 'collection' },
          ordering
        ),
      /valid Kitchen service/
    )
  }
  assert.throws(
    () =>
      readMenuOrderSelection(
        { kitchen_service_id: 'dinner', order_type: 'delivery' },
        ordering
      ),
    /valid order type/
  )
})

test('a paused or unscheduled service cannot borrow another service availability', () => {
  const types = [
    policy('lunch'),
    policy('dinner', { availability: { paused: true } }),
  ]
  assert.throws(
    () =>
      readMenuOrderSelection(
        { kitchen_service_id: 'dinner', order_type: 'collection' },
        { enabled: true, order_types: types }
      ),
    /paused/
  )
  types[1] = policy('dinner', { service_hours: undefined })
  assert.throws(
    () =>
      readMenuOrderSelection(
        { kitchen_service_id: 'dinner', order_type: 'collection' },
        { enabled: true, order_types: types }
      ),
    /Serving hours/
  )
})

test('idempotency fingerprints distinguish the same basket in different services', () => {
  const command = {
    actorId: 'menu',
    channel: 'menu',
    orderType: 'collection',
    requestedItems: [],
    customer: {},
  }
  const first = menuOrderIdempotencyRequest(
    { ...command, kitchenServiceId: 'lunch' },
    'food'
  )
  const second = menuOrderIdempotencyRequest(
    { ...command, kitchenServiceId: 'dinner' },
    'food'
  )
  assert.notDeepEqual(first, second)
  assert.equal(first.kitchen_service_id, 'lunch')
})

test('mixed basket rejects a Menu which supports the mode only through a different service', async () => {
  const { resolveMenuOrderItems } = load(
    'order-items',
    'resolveMenuOrderItems',
    {
      createError,
      text,
      isMenuOrderingEnabled: (value) => value.enabled,
      readKitchenMenuOrdering: (_, menuId) => ({
        enabled: true,
        order_types: [policy(menuId === 'food' ? 'lunch' : 'dinner')],
      }),
      readKitchenMenuSections: async () => [],
    }
  )
  const db = {
    doc: () => ({
      get: async () => ({
        exists: true,
        data: () => ({ status: 'published' }),
      }),
    }),
  }
  await assert.rejects(
    resolveMenuOrderItems(db, {
      context: { kitchenId: 'kitchen', menuId: 'food' },
      kitchenServiceId: 'lunch',
      orderType: 'collection',
      requestedItems: [{ menuId: 'drinks', itemId: 'tea' }],
    }),
    /does not accept this order type/
  )
})
