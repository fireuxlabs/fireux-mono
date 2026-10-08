import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const tableSource = readFileSync(
  new URL('../runtime/kitchen/utils/table-service.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const tableChannelEnabled = compileFunction(
  `${stripTypeScriptTypes(tableSource)}; return tableChannelEnabled`
)()

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
    tableChannelEnabled,
    text,
    isMenuOrderingEnabled: (ordering) => ordering.enabled,
    normalizeOrderType: (type, allowed) => {
      if (!allowed.includes(type)) throw new Error('Choose a valid order type.')
      return type
    },
    readMenuOrderChannel: (channel) => channel || 'menu',
  }
)
const hours = {
  timezone: 'Europe/Zurich',
  windows: [{ days: ['monday'], open: '12:00', close: '14:00' }],
}
const policy = (id, overrides = {}) => ({
  kitchen_offering_id: id,
  kitchen_offering_name: id,
  type: 'collection',
  offering_hours: { operation_hours: hours },
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
    { kitchen_offering_id: 'dinner', order_type: 'collection' },
    ordering
  )
  assert.equal(selected.kitchenOfferingId, 'dinner')
  assert.equal(selected.orderTypeConfig.notice_hours, 3)
  for (const kitchen_offering_id of ['', 'unknown', ['dinner'], 1]) {
    assert.throws(
      () =>
        readMenuOrderSelection(
          { kitchen_offering_id, order_type: 'collection' },
          ordering
        ),
      /valid Kitchen service/
    )
  }
  assert.throws(
    () =>
      readMenuOrderSelection(
        { kitchen_offering_id: 'dinner', order_type: 'delivery' },
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
        { kitchen_offering_id: 'dinner', order_type: 'collection' },
        { enabled: true, order_types: types }
      ),
    /paused/
  )
  types[1] = policy('dinner', { offering_hours: undefined })
  assert.throws(
    () =>
      readMenuOrderSelection(
        { kitchen_offering_id: 'dinner', order_type: 'collection' },
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
    { ...command, kitchenOfferingId: 'lunch' },
    'food'
  )
  const second = menuOrderIdempotencyRequest(
    { ...command, kitchenOfferingId: 'dinner' },
    'food'
  )
  assert.notDeepEqual(first, second)
  assert.equal(first.kitchen_offering_id, 'lunch')
})

test('mixed basket rejects a Menu which supports the mode only through a different service', async () => {
  const { resolveMenuOrderItems } = load(
    'order-items',
    'resolveMenuOrderItems',
    {
      createError,
      tableChannelEnabled,
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
      kitchenOfferingId: 'lunch',
      orderType: 'collection',
      requestedItems: [{ menuId: 'drinks', itemId: 'tea' }],
    }),
    /does not accept this order type/
  )
})

test('table orders enforce the saved channel switches at submission', () => {
  const config = {
    enabled: true,
    order_types: [
      policy('tables', {
        type: 'dine_in',
        table_channels: { staff_pos: true, table_qr: false },
      }),
    ],
  }
  const body = {
    kitchen_offering_id: 'tables',
    order_type: 'dine_in',
    channel: 'staff_pos',
  }
  assert.equal(readMenuOrderSelection(body, config).channel, 'staff_pos')
  assert.throws(
    () => readMenuOrderSelection({ ...body, channel: 'table_qr' }, config),
    /switched off/
  )
  config.order_types[0].table_channels = { staff_pos: false, table_qr: true }
  assert.equal(
    readMenuOrderSelection({ ...body, channel: 'table_qr' }, config).channel,
    'table_qr'
  )
  assert.throws(() => readMenuOrderSelection(body, config), /switched off/)
})
