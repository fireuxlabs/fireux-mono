import assert from 'node:assert/strict'
import test from 'node:test'
import { load } from './offering-test-helpers.mjs'
const model = load(
  '../../runtime/kitchen/models/order.model.ts',
  'OrderChannels'
)
const {
  createOrderDraft,
  addOrderLine,
  updateOrderLineQuantity,
  removeOrderLine,
  readOrderingConfiguration,
  requireOrderChannel,
  readOrder,
  readSavedOrderDraft,
} = load(
  '../../runtime/kitchen/utils/ordering.ts',
  'createOrderDraft,addOrderLine,updateOrderLineQuantity,removeOrderLine,readOrderingConfiguration,requireOrderChannel,readOrder,readSavedOrderDraft',
  model
)
const channels = { readOrderingConfiguration, requireOrderChannel }

test('drafts require an explicit supported channel and begin without lines or progress', () => {
  const config = { channels: ['pos', 'website'] }
  assert.deepEqual(createOrderDraft({ id: 'a', number: '1' }, 'pos', config), {
    id: 'a',
    number: '1',
    channel: 'pos',
    lines: [],
  })
  for (const channel of ['kiosk', 'unknown', '', undefined])
    assert.throws(() =>
      createOrderDraft({ id: 'a', number: '1' }, channel, config)
    )
  assert.throws(() =>
    createOrderDraft({ id: 'a', number: '1' }, 'pos', undefined)
  )
  assert.throws(() =>
    channels.readOrderingConfiguration({ channels: ['pos', 'pos'] })
  )
  assert.throws(() =>
    channels.readOrderingConfiguration({ channels: ['unknown'] })
  )
  assert.throws(() => channels.requireOrderChannel('pos', { channels: [] }))
})

test('adding a line keeps the draft and caller input unchanged, including fractional quantities', () => {
  const order = Object.freeze({
    ...createOrderDraft({ id: 'a', number: '1' }, 'pos', { channels: ['pos'] }),
    lines: Object.freeze([]),
  })
  const line = Object.freeze({
    id: ' line-1 ',
    item: Object.freeze({ name: ' Potatoes ' }),
    quantity: 2.5,
    unit_code: ' KGM ',
  })
  const next = addOrderLine(order, line)
  assert.deepEqual(next.lines, [
    {
      id: 'line-1',
      item: { name: 'Potatoes' },
      quantity: 2.5,
      unit_code: 'KGM',
    },
  ])
  assert.equal(order.lines.length, 0)
  assert.equal(line.item.name, ' Potatoes ')
  assert.notEqual(next.lines[0].item, line.item)
  const another = addOrderLine(next, { ...line, id: 'line-2' })
  assert.equal(another.lines.length, 2)
  assert.equal(next.lines.length, 1)
  assert.throws(() => addOrderLine(next, line), /unique/)
})

test('invalid lines cannot alter the order', () => {
  const order = createOrderDraft({ id: 'a', number: '1' }, 'website', {
    channels: ['website'],
  })
  const valid = {
    id: 'line-1',
    item: { name: 'Soup' },
    quantity: 1,
    unit_code: 'C62',
  }
  const invalid = [
    null,
    {},
    { ...valid, id: ' ' },
    { ...valid, item: null },
    { ...valid, item: { name: ' ' } },
    { ...valid, unit_code: ' ' },
    ...[0, -1, NaN, Infinity, '2'].map((quantity) => ({ ...valid, quantity })),
  ]
  for (const line of invalid) assert.throws(() => addOrderLine(order, line))
  assert.deepEqual(order.lines, [])
})

test('quantity changes and removal are explicit immutable actions on exact line identities', () => {
  const draft = createOrderDraft({ id: 'a', number: '1' }, 'pos', {
    channels: ['pos'],
  })
  const line = {
    id: 'first',
    item: { name: 'Soup' },
    quantity: 1,
    unit_code: 'C62',
  }
  const order = addOrderLine(addOrderLine(draft, line), {
    ...line,
    id: 'second',
  })
  const updated = updateOrderLineQuantity(order, 'first', 2.5)
  assert.equal(order.lines[0].quantity, 1)
  assert.equal(updated.lines[0].quantity, 2.5)
  assert.equal(updated.lines[1].quantity, 1)
  for (const quantity of [0, -1, NaN, Infinity, '2'])
    assert.throws(() => updateOrderLineQuantity(order, 'first', quantity))
  assert.throws(() => updateOrderLineQuantity(order, 'missing', 2), /not found/)
  assert.throws(() => removeOrderLine(order, 'missing'), /not found/)
  const removed = removeOrderLine(updated, 'first')
  assert.deepEqual(
    removed.lines.map((line) => line.id),
    ['second']
  )
  assert.equal(updated.lines.length, 2)
  assert.deepEqual(removeOrderLine(removed, 'second').lines, [])
})

 test('optional placer and location are shared channel-independent detached context', () => {
  const input = { id: 'context', number: '1', channel: 'website', lines: [], placed_by: { kind: 'person', id: 'staff', name: ' Alex ' }, location: { name: ' Table 12 ' } }
  const order = readOrder(input)
  assert.equal(order.placed_by.name, 'Alex')
  assert.equal(order.location.name, 'Table 12')
  input.location.name = 'Changed'
  assert.equal(order.location.name, 'Table 12')
  assert.equal(readOrder({ ...order, channel: 'api', placed_by: { kind: 'system', name: 'Partner' } }).placed_by.kind, 'system')
  for (const context of [{ kind: 'staff', name: 'Alex' }, { kind: 'person', name: '' }, { kind: 'person', name: 'Alex', role: 'admin' }]) assert.throws(() => readOrder({ ...order, placed_by: context }))
  assert.throws(() => readOrder({ ...order, location: { name: 'Table', table: 12 } }))
  assert.deepEqual(readSavedOrderDraft('context', { schema_version: 1, kitchen_id: 'k', revision: 1, ...order }, 'k').order, order)
  assert.equal(readSavedOrderDraft('context', { schema_version: 1, kitchen_id: 'k', revision: 1, ...order, placed_by: null, location: null }, 'k').order.location, undefined)
})

test('fulfilment is independent of channel and accepts only supported methods', () => {
  for (const method of ['', 'on_site', 'takeaway', 'collection', 'delivery']) {
    const input = { id: 'a', number: '1', channel: 'kiosk', lines: [], fulfilment: method }
    const order = readOrder(input)
    assert.equal(order.fulfilment, method)
    input.fulfilment = 'changed'
    assert.equal(order.fulfilment, method)
  }
  for (const fulfilment of [{ method: 'unknown' }, { method: 'collection', extra: true }, null]) assert.throws(() => readOrder({ id: 'a', number: '1', channel: 'kiosk', lines: [], fulfilment }))
})

test('empty order numbers are valid until assigned', () => {
  const draft = createOrderDraft({ id: 'new', number: '' }, 'pos', { channels: ['pos'] })
  assert.equal(readOrder(draft).number, '')
})

test('post-info validates and detaches customer, address and requested time', () => {
 const base = { id: 'post', number: '', channel: 'website', lines: [] }
 const source = { ...base, customer: { name: ' Sam ', phone: ' 12345 ' }, delivery_address: ' Example Street ', requested_at: '2026-10-20T12:30:00.000Z' }
 const result = readOrder(source)
 assert.deepEqual(result.customer, { name: 'Sam', phone: '12345' })
 assert.equal(result.delivery_address, 'Example Street')
 source.customer.name = 'Changed'
 assert.equal(result.customer.name, 'Sam')
 for (const customer of [{}, { name: '' }, { email: 'test' }, { name: 3 }]) assert.throws(() => readOrder({ ...base, customer }))
 for (const requested_at of ['tomorrow', '2026-02-30T12:30:00.000Z', '2026-10-20']) assert.throws(() => readOrder({ ...base, requested_at }))
 assert.throws(() => readOrder({ ...base, delivery_address: '' }))
})


test('item choice notes survive order parsing and quantity edits with bounded plain text', () => {
  const order = readOrder({ id: 'choice-test', number: '', channel: 'website', lines: [{ id: 'line', item: { name: 'Pizza' }, quantity: 1, unit_code: 'C62', notes: [' Cheese ', 'Bottle exchange · no deposit'] }] })
  assert.deepEqual(order.lines[0].notes, ['Cheese', 'Bottle exchange · no deposit'])
  assert.deepEqual(updateOrderLineQuantity(order, 'line', 2).lines[0].notes, order.lines[0].notes)
  for (const notes of ['text', [null], [''], ['x'.repeat(501)], Array(1101).fill('choice')])
    assert.throws(() => readOrder({ ...order, lines: [{ ...order.lines[0], notes }] }), /notes/)
})
