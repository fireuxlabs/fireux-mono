import assert from 'node:assert/strict'
import test from 'node:test'
import { matchesOrderBoardFilters } from '../runtime/kitchen/utils/order-board-filter.ts'
const order = (order_type, status = 'pending_acceptance', collection = {}) => ({
  order_type,
  status,
  collection,
})
test('type filters preserve independent Kitchen order types', () => {
  const records = [
    'dine_in',
    'eat_in',
    'takeaway',
    'collection',
    'delivery',
    'pre_order',
    'room_service',
  ].map((type) => order(type))
  for (const record of records)
    assert.deepEqual(
      records.filter((value) =>
        matchesOrderBoardFilters(value, {
          type: record.order_type,
          timing: 'all',
        })
      ),
      [record]
    )
  assert.equal(
    records.filter((value) =>
      matchesOrderBoardFilters(value, { type: 'all', timing: 'all' })
    ).length,
    records.length
  )
})
test('scheduled filter includes pre-orders and scheduled collection at every board stage', () => {
  for (const status of ['pending_acceptance', 'scheduled', 'queue', 'ready']) {
    assert.equal(
      matchesOrderBoardFilters(order('pre_order', status), {
        type: 'all',
        timing: 'scheduled',
      }),
      true
    )
    assert.equal(
      matchesOrderBoardFilters(
        order('collection', status, { mode: 'scheduled' }),
        { type: 'collection', timing: 'scheduled' }
      ),
      true
    )
  }
  assert.equal(
    matchesOrderBoardFilters(order('collection'), {
      type: 'all',
      timing: 'scheduled',
    }),
    false
  )
  assert.equal(
    matchesOrderBoardFilters(order('delivery'), {
      type: 'all',
      timing: 'immediate',
    }),
    true
  )
})
test('type and timing filters compose without mutating records', () => {
  const record = order('pre_order')
  assert.equal(
    matchesOrderBoardFilters(record, { type: 'delivery', timing: 'scheduled' }),
    false
  )
  assert.equal(
    matchesOrderBoardFilters(record, {
      type: 'pre_order',
      timing: 'immediate',
    }),
    false
  )
  assert.deepEqual(record, order('pre_order'))
})
