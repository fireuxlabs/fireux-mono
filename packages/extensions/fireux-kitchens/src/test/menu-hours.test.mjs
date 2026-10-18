import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadOfferingSource,
  weekdayHoursConstraints,
  serviceHoursPolicy,
} from './offering-test-helpers.mjs'

const hours = (days, open, close) => ({
  source: 'custom',
  timezone: 'Europe/Zurich',
  windows: [{ days, open, close }],
})
const { intersectWeekdayHours, weekdayHoursWithin } = weekdayHoursConstraints
const { constrainMenuOfferings } = loadOfferingSource(
  'menu/utils/menu-hours',
  'constrainMenuOfferings',
  {
    normalizeKitchenOfferings: (rows) => structuredClone(rows),
    readWeekdayTimeWindowsConfig: (value) => value,
    intersectWeekdayHours,
  }
)

test('intersection preserves parent breaks without changing saved schedules', () => {
  const child = hours(['monday'], '09:00', '17:00')
  const parent = hours(['monday'], '08:00', '12:00')
  parent.windows.push({ days: ['monday'], open: '14:00', close: '18:00' })
  const before = structuredClone({ child, parent })
  assert.deepEqual(intersectWeekdayHours(child, parent).windows, [
    { days: ['monday'], open: '09:00', close: '12:00' },
    { days: ['monday'], open: '14:00', close: '17:00' },
  ])
  assert.deepEqual({ child, parent }, before)
})

test('overnight intersection respects the next day and Sunday week boundary', () => {
  const child = hours(['sunday'], '22:00', '03:00')
  const parent = hours(['monday'], '00:00', '02:00')
  const effective = intersectWeekdayHours(child, parent)
  assert.deepEqual(effective.windows, [
    { days: ['monday'], open: '00:00', close: '02:00' },
  ])
  assert.equal(weekdayHoursWithin(effective, parent), true)
})

test('missing parent windows, timezone mismatch and non-overlap are unavailable', () => {
  const child = hours(['tuesday'], '10:00', '12:00')
  for (const parent of [
    { ...child, windows: [] },
    { ...child, timezone: 'UTC' },
    hours(['tuesday'], '13:00', '17:00'),
  ])
    assert.deepEqual(intersectWeekdayHours(child, parent).windows, [])
})

test('parent narrowing constrains services and Menu times without cascading writes', () => {
  const saved = [
    {
      id: 'collection',
      hours_source: 'custom',
      hours: hours(['tuesday'], '08:00', '22:00'),
    },
  ]
  const before = structuredClone(saved)
  const services = serviceHoursPolicy.resolveServiceHours(
    saved,
    hours(['tuesday'], '10:00', '18:00')
  )
  assert.deepEqual(services[0].hours.windows, [
    { days: ['tuesday'], open: '10:00', close: '18:00' },
  ])
  const menus = constrainMenuOfferings(
    services,
    hours(['tuesday'], '11:30', '13:30')
  )
  assert.deepEqual(menus[0].hours.windows, [
    { days: ['tuesday'], open: '11:30', close: '13:30' },
  ])
  assert.deepEqual(constrainMenuOfferings(services, null), services)
  assert.deepEqual(
    constrainMenuOfferings(services, { ...services[0].hours, windows: [] })[0]
      .hours.windows,
    []
  )
  assert.deepEqual(
    constrainMenuOfferings(services, hours(['wednesday'], '11:30', '13:30'))[0]
      .hours.windows,
    []
  )
  assert.deepEqual(saved, before)
})

test('public directory and manifest project the same Menu window', async () => {
  const service = {
    id: 'collection',
    hours: hours(['tuesday'], '10:00', '18:00'),
  }
  const own = hours(['tuesday'], '11:30', '13:30')
  const expected = [{ days: ['tuesday'], open: '11:30', close: '13:30' }]
  const shared = {
    constrainMenuOfferings,
    readRecordString: (data, key) => String(data[key] || ''),
    menuSourceFromData: () => ({ kitchen_id: 'venue' }),
  }
  const { projectMenuDirectoryEntry } = loadOfferingSource(
    'menu/server/index/projection',
    'projectMenuDirectoryEntry',
    {
      ...shared,
      readKitchenMenuOrdering: () => ({ order_types: [] }),
      guestDiscoverableMenuContexts: () => [],
      readKitchenPublicOfferings: (value) => value,
    }
  )
  const entry = projectMenuDirectoryEntry(
    {
      id: 'lunch',
      data: { name: 'Lunch', status: 'published', serving_hours: own },
    },
    { kitchenId: 'venue', kitchenSlug: 'venue' },
    { kitchenOfferings: [service] }
  )
  assert.deepEqual(entry.offerings[0].hours.windows, expected)
  const { buildMenuManifestPayload } = loadOfferingSource(
    'menu/server/payload/manifest',
    'buildMenuManifestPayload',
    {
      ...shared,
      readMenuManifestSections: () => [],
      readMenuPromotions: async () => [],
      menuOfferingProfile: (scope) => ({ offerings: scope.kitchen_offerings }),
      menuPayloadPresentation: () => ({}),
    }
  )
  const payload = await buildMenuManifestPayload(
    'lunch',
    { serving_hours: own },
    {
      currencyCode: 'CHF',
      kitchen_offerings: [service],
    }
  )
  assert.deepEqual(
    payload.manifest.behaviour.offerings[0].hours.windows,
    expected
  )
})
