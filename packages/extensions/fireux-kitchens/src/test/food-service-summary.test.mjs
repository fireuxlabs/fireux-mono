import test from 'node:test'
import assert from 'node:assert/strict'
import { readOpeningHoursStatus } from '../../../fireux-places/src/runtime/place/utils/opening-hours-status.ts'
import {
  loadOfferingSource,
  offeringOverviewPolicy,
  serviceMenuPolicy,
  weekdayHoursConstraints,
} from './offering-test-helpers.mjs'
const constrainMenuOfferings = loadOfferingSource(
  'menu/utils/menu-hours',
  'constrainMenuOfferings',
  {
    normalizeKitchenOfferings: (value) => value,
    readWeekdayTimeWindowsConfig: (value) => value,
    ...weekdayHoursConstraints,
  }
).constrainMenuOfferings
const { foodServiceSummary } = loadOfferingSource(
  'kitchen/utils/food-service-summary',
  'foodServiceSummary',
  {
    ...offeringOverviewPolicy,
    ...serviceMenuPolicy,
    constrainMenuOfferings,
    readOpeningHoursStatus,
  }
)
const hours = (start, end) => ({
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days: ['tuesday'], open: start, close: end }],
})
const menu = {
  id: 'food',
  name: 'Food',
  status: 'published',
  format: 'interactive',
}
const service = {
  id: 'main',
  name: 'Collection',
  enabled: true,
  menu_ids: ['food'],
  hours: hours('16:00', '22:45'),
  interactions: [{ type: 'collection', enabled: true }],
}
const at = (time) => new Date(`2026-10-20T${time}:00+02:00`)
test('overview lists enabled services, next opening and current serving state', () => {
  assert.equal(
    foodServiceSummary([{ ...service, enabled: false }], [menu], at('17:00'))
      .length,
    0
  )
  const closed = foodServiceSummary([service], [menu], at('15:00'))[0]
  assert.equal(closed.open, false)
  assert.match(closed.label, /16:00/)
  assert.equal(
    foodServiceSummary([service], [menu], at('17:00'))[0].label,
    'Serving now'
  )
})
test('menu hours narrow availability, while missing menus and pauses remain explicit', () => {
  const limited = { ...menu, serving_hours: hours('18:00', '20:00') }
  assert.match(
    foodServiceSummary([service], [limited], at('17:00'))[0].label,
    /18:00/
  )
  assert.equal(
    foodServiceSummary([service], [], at('17:00'))[0].label,
    'Needs setup'
  )
  const paused = {
    ...service,
    interactions: [
      { type: 'collection', enabled: true, availability: { paused: true } },
    ],
  }
  assert.equal(
    foodServiceSummary([paused], [menu], at('17:00'))[0].label,
    'Paused'
  )
})
test('separate services retain their own summary and next-day collection is not serving now', () => {
  const separate = {
    ...service,
    id: 'concept',
    name: 'Picnic',
    separate: true,
    collection_timing: 'next_day',
  }
  const rows = foodServiceSummary([service, separate], [menu], at('17:00'))
  assert.equal(rows.length, 2)
  assert.equal(rows[1].name, 'Collection · Picnic')
  assert.equal(rows[1].label, 'Next-day collection')
  assert.equal(rows[1].open, false)
})
