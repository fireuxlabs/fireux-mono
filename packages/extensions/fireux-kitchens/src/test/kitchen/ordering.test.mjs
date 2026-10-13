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
} = load(
  '../../runtime/kitchen/utils/ordering.ts',
  'createOrderDraft,addOrderLine,updateOrderLineQuantity,removeOrderLine,readOrderingConfiguration,requireOrderChannel',
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
