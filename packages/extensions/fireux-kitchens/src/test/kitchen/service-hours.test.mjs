import assert from 'node:assert/strict'
import test from 'node:test'
import {
  serviceHoursPolicy,
  testKitchenHours,
} from '../offering-test-helpers.mjs'
const { hoursWithinParent, resolveServiceHours } = serviceHoursPolicy
const hours = (days, open, close) => ({
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days, open, close }],
})
test('inherited service hours follow the current parent without editing stored settings', () => {
  const records = [
    {
      id: 'inherit',
      name: 'Collection',
      enabled: true,
      menu_ids: ['food'],
      interactions: [],
    },
  ]
  const before = structuredClone(records)
  const first = hours(['monday'], '08:00', '17:00')
  const second = hours(['tuesday'], '10:00', '18:00')
  assert.deepEqual(resolveServiceHours(records, first)[0].hours, first)
  assert.deepEqual(resolveServiceHours(records, second)[0].hours, second)
  assert.deepEqual(records, before)
})
test('custom service hours and an unfinished custom configuration do not inherit', () => {
  const own = hours(['friday'], '12:00', '14:00')
  const rows = [
    { id: 'custom', hours_source: 'custom', hours: own },
    { id: 'empty', hours_source: 'custom' },
  ]
  const resolved = resolveServiceHours(rows, testKitchenHours())
  assert.deepEqual(resolved[0].hours, own)
  assert.equal(resolved[1].hours, undefined)
})
test('custom ranges must fit parent days and times, including overnight and week wrap', () => {
  const parent = hours(['friday', 'sunday'], '20:00', '02:00')
  assert.equal(
    hoursWithinParent(hours(['friday'], '21:00', '01:00'), parent),
    true
  )
  assert.equal(
    hoursWithinParent(hours(['monday'], '00:30', '01:30'), parent),
    true
  )
  assert.equal(
    hoursWithinParent(hours(['friday'], '19:00', '21:00'), parent),
    false
  )
  assert.equal(
    hoursWithinParent(hours(['saturday'], '01:00', '03:00'), parent),
    false
  )
  assert.equal(
    hoursWithinParent(hours(['tuesday'], '21:00', '23:00'), parent),
    false
  )
  assert.equal(hoursWithinParent({ ...parent, timezone: 'UTC' }, parent), false)
  assert.equal(hoursWithinParent(parent, { ...parent, windows: [] }), false)
})
test('custom hours cannot bridge a parent service break', () => {
  const parent = {
    ...hours(['monday'], '08:00', '12:00'),
    windows: [
      { days: ['monday'], open: '08:00', close: '12:00' },
      { days: ['monday'], open: '14:00', close: '18:00' },
    ],
  }
  assert.equal(
    hoursWithinParent(hours(['monday'], '09:00', '11:00'), parent),
    true
  )
  assert.equal(
    hoursWithinParent(hours(['monday'], '11:00', '15:00'), parent),
    false
  )
})
