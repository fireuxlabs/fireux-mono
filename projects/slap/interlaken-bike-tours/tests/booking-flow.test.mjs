import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const tours = [
  {
    slug: 'interlaken-panorama',
    name: 'Interlaken Panorama',
    duration: '4 hours',
    durationHours: 4,
    price: 159,
  },
  {
    slug: 'lauterbrunnen-valley',
    name: 'Lauterbrunnen Valley',
    duration: '6 hours',
    durationHours: 6,
    price: 259,
  },
]

const sharedSource = readFileSync(
  new URL('../../../../packages/extensions/fireux-bookings/src/runtime/server/booking.ts', import.meta.url), 'utf8'
).replace(/^export /gm, '')
const { BookingError, confirmBooking } = compileFunction(
  `${stripTypeScriptTypes(sharedSource)}; return { BookingError, confirmBooking }`
)()

const availabilitySource = readFileSync(new URL('../../../../packages/extensions/fireux-bookings/src/runtime/utils/availability.ts', import.meta.url), 'utf8').replace(/^import .*$/gm, '').replace(/^export /gm, '')
const { defaultBookingAvailability, readBookingAvailability, isBookingDayOpen } = compileFunction(`${stripTypeScriptTypes(availabilitySource)}; return { defaultBookingAvailability, readBookingAvailability, isBookingDayOpen }`)()

const source = readFileSync(
  new URL('../server/utils/tour-booking.ts', import.meta.url),
  'utf8'
)
  .replace(/^import \{ BookingError, confirmBooking \} from .*$/m, '')
  .replace(/^import \{ tours \} from .*$/m, 'const tours = injectedTours')
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '')
const workflowModule = compileFunction(
  `${stripTypeScriptTypes(source)}; return { createInterlakenTourBookingWorkflow, InterlakenTourBookingError }`,
  ['injectedTours', 'BookingError', 'confirmBooking', 'isBookingDayOpen']
)(tours, BookingError, confirmBooking, isBookingDayOpen)

const storeSource = readFileSync(
  new URL('../server/utils/tour-booking-store.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from\s+['"][^'"]+['"]\r?\n/gm, '')
  .replace(/^export /gm, '')
const sharedStoreSource = readFileSync(new URL('../../../../packages/extensions/fireux-bookings/src/runtime/server/business/store.ts', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?from\s+['"][^'"]+['"]\r?\n/gm, '').replace(/^export /gm, '')
function storeModule(runGuardedServerTransaction, getRuntimeFirestore, defineFirestoreMutationTarget, BookingError) {
  const businessBookingTargets = (id) => ({ bookings: { collectionPath: `businesses/${id}/bookings` }, locks: { collectionPath: `businesses/${id}/booking-locks` }, settings: { collectionPath: `businesses/${id}/booking-settings` } })
  const createBusinessBookingStore = compileFunction(`${stripTypeScriptTypes(sharedStoreSource)}; return createBusinessBookingStore`,
    ['runGuardedServerTransaction', 'getRuntimeFirestore', 'businessBookingTargets', 'BUSINESS_MUTATION_TARGETS', 'readBookingAvailability', 'isBookingDayOpen', 'BookingError']
  )(runGuardedServerTransaction, getRuntimeFirestore, businessBookingTargets, { businesses: { collectionPath: 'businesses' } }, readBookingAvailability, isBookingDayOpen, BookingError)
  return compileFunction(`${stripTypeScriptTypes(storeSource)}; return { createInterlakenTourBookingStore }`, ['createBusinessBookingStore'])(createBusinessBookingStore)
}

function loadRoute(path, injectedNames, injectedValues) {
  const routeSource = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from\s+['"][^'"]+['"]\r?\n/gm, '')
    .replace(/^export default /m, 'return ')
  const wrappedRoute = stripTypeScriptTypes(
    `(function () { ${routeSource} })()`
  )
  return compileFunction(
    `return ${wrappedRoute}`,
    injectedNames
  )(...injectedValues)
}

const input = {
  tourSlug: 'interlaken-panorama',
  date: '2026-11-05',
  guestName: 'Test Guest',
  guestEmail: 'guest@example.test',
  groupSize: 2,
  availabilityRevision: 0,
}

function harness(options = {}) {
  const documents = new Map([['businesses/business-1', { name: 'Test operator' }]])
  if (options.settings) documents.set('businesses/business-1/booking-settings/availability', options.settings)
  const db = {
    collection: (collectionPath) => ({
      doc: (id) => ({
        get: async () => {
          const path = `${collectionPath}/${id}`
          return {
            exists: documents.has(path),
            data: () => documents.get(path),
          }
        },
      }),
    }),
  }
  const runGuardedServerTransaction = async (_placement, run) => {
    const writes = []
    const pathFor = (target, id) => `${target.collectionPath}/${id}`
    const transaction = {
      read: async (target, id) => {
        const path = pathFor(target, id)
        return { exists: documents.has(path), data: documents.get(path) }
      },
      create: (target, id, value) => {
        writes.push(() => {
          const path = pathFor(target, id)
          if (documents.has(path)) throw new Error('Document already exists.')
          documents.set(path, structuredClone(value))
        })
      },
      update: (target, id, patch) => {
        writes.push(() => {
          const path = pathFor(target, id)
          documents.set(path, {
            ...documents.get(path),
            ...structuredClone(patch),
          })
        })
      },
      delete: (target, id) => {
        writes.push(() => documents.delete(pathFor(target, id)))
      },
    }
    const result = await run(transaction)
    writes.forEach((write) => write())
    return result
  }
  const store = storeModule(
    runGuardedServerTransaction,
    () => db,
    (target) => target,
    workflowModule.InterlakenTourBookingError
  ).createInterlakenTourBookingStore('business-1')
  const records = {
    get: (id) => documents.get(`businesses/business-1/bookings/${id}`),
    set: (id, value) => documents.set(`businesses/business-1/bookings/${id}`, value),
    get size() {
      return [...documents.keys()].filter((path) =>
        path.startsWith('businesses/business-1/bookings/')
      ).length
    },
  }
  const dayLocks = {
    has: (date) => documents.has(`businesses/business-1/booking-locks/${date}`),
    get: (date) =>
      documents.get(`businesses/business-1/booking-locks/${date}`)?.booking_id,
    set: (date, bookingId) =>
      documents.set(`businesses/business-1/booking-locks/${date}`, {
        booking_id: bookingId,
      }),
    delete: (date) => documents.delete(`businesses/business-1/booking-locks/${date}`),
  }
  const events = []
  const busyCalls = []
  let requestCount = 0
  const calendar = {
    readBusy: async (startAt, endAt) => {
      requestCount += 1
      busyCalls.push({ startAt, endAt })
      if (options.busyOnCall === requestCount) return options.busy ?? []
      return options.busy ?? []
    },
    createEvent: async (event) => {
      events.push(structuredClone(event))
      if (options.eventError) throw new Error('provider failure')
      return { id: 'calendar-event-1' }
    },
  }
  const workflow = workflowModule.createInterlakenTourBookingWorkflow({
    calendar,
    store,
    now: () => new Date('2026-11-04T12:00:00.000Z'),
    createId: () => 'booking-1',
  })
  return { workflow, records, dayLocks, events, busyCalls, documents }
}

test('guest can check, book and receive immediate confirmation at the fixed catalog price', async () => {
  const h = harness()
  const available = await h.workflow.checkAvailability(input)

  assert.equal(available.available, true)
  assert.equal(available.departureTime, '09:00')
  assert.equal(available.startAt, '2026-11-05T09:00:00+01:00')
  assert.equal(available.endAt, '2026-11-05T13:00:00+01:00')

  const result = await h.workflow.book(input)
  assert.deepEqual(result.booking, {
    id: 'booking-1',
    tourSlug: 'interlaken-panorama',
    tourName: 'Interlaken Panorama',
    date: '2026-11-05',
    departureTime: '09:00',
    timeZone: 'Europe/Zurich',
    startAt: '2026-11-05T09:00:00+01:00',
    endAt: '2026-11-05T13:00:00+01:00',
    groupSize: 2,
    unitPriceChf: 159,
    totalPriceChf: 318,
    currency: 'CHF',
    status: 'confirmed',
  })
  assert.equal(h.events.length, 1)
  assert.equal(h.events[0].guestEmail, input.guestEmail)
  assert.equal(h.events[0].bookingReference, 'booking-1')
  assert.equal(h.records.get('booking-1').status, 'confirmed')
  assert.equal(h.records.get('booking-1').guestEmail, undefined)
  assert.equal(h.records.get('booking-1').guest_name, input.guestName)
  assert.equal(h.records.get('booking-1').guest_email, input.guestEmail)
  assert.equal(h.dayLocks.get(input.date), 'booking-1')
})

test('availability hides a date busy in Google Calendar', async () => {
  const h = harness({
    busy: [
      {
        start: '2026-11-05T10:30:00+01:00',
        end: '2026-11-05T11:00:00+01:00',
      },
    ],
  })

  const available = await h.workflow.checkAvailability(input)
  assert.equal(available.available, false)
  assert.equal(available.reason, 'calendar-busy')
  await assert.rejects(
    h.workflow.book(input),
    (error) =>
      error instanceof workflowModule.InterlakenTourBookingError &&
      error.statusCode === 409
  )
  assert.equal(h.records.size, 0)
  assert.equal(h.events.length, 0)
})

test('a second booking for the same day conflicts after the first is confirmed', async () => {
  const h = harness()
  await h.workflow.book(input)

  const available = await h.workflow.checkAvailability(input)
  assert.equal(available.available, false)
  assert.equal(available.reason, 'booked')
  await assert.rejects(
    h.workflow.book(input),
    (error) =>
      error instanceof workflowModule.InterlakenTourBookingError &&
      error.statusCode === 409
  )
  assert.equal(h.events.length, 1)
  assert.equal(h.records.size, 1)
})

test('a calendar conflict appearing during checkout releases the pending day lock', async () => {
  let busyRead = 0
  const h = harness()
  h.workflow = workflowModule.createInterlakenTourBookingWorkflow({
    store: {
      readAvailability: async () => defaultBookingAvailability(),
      isDateReserved: async (date) => h.dayLocks.has(date),
      reserve: async (date, booking) => {
        h.records.set(booking.id, structuredClone(booking))
        h.dayLocks.set(date, booking.id)
      },
      confirm: async () =>
        assert.fail('conflicting booking must not be confirmed'),
      release: async (date, bookingId) => {
        h.records.get(bookingId).status = 'failed'
        h.dayLocks.delete(date)
      },
    },
    calendar: {
      readBusy: async () => {
        busyRead += 1
        return busyRead === 1
          ? []
          : [
              {
                start: '2026-11-05T09:00:00+01:00',
                end: '2026-11-05T10:00:00+01:00',
              },
            ]
      },
      createEvent: async () =>
        assert.fail('event must not be inserted after a new conflict'),
    },
    now: () => new Date('2026-11-04T12:00:00.000Z'),
    createId: () => 'booking-1',
  })

  await assert.rejects(
    h.workflow.book(input),
    (error) =>
      error instanceof workflowModule.InterlakenTourBookingError &&
      error.statusCode === 409
  )
  assert.equal(h.dayLocks.has(input.date), false)
  assert.equal(h.records.get('booking-1').status, 'failed')
})

test('an ambiguous Calendar insert failure retains the pending lock for reconciliation', async () => {
  const h = harness({ eventError: true })
  await assert.rejects(
    h.workflow.book(input),
    (error) =>
      error instanceof workflowModule.InterlakenTourBookingError &&
      error.statusCode === 503 &&
      error.code === 'booking_reconciliation_required' &&
      error.message.includes('booking-1')
  )
  assert.equal(h.dayLocks.has(input.date), true)
  assert.equal(h.records.get('booking-1').status, 'pending')
})

test('availability uses the correct Zurich offset during summer time', async () => {
  const h = harness()
  const availability = await h.workflow.checkAvailability({
    tourSlug: 'lauterbrunnen-valley',
    date: '2027-07-03',
  })
  assert.equal(availability.startAt, '2027-07-03T09:00:00+02:00')
  assert.equal(availability.endAt, '2027-07-03T15:00:00+02:00')
})

test('availability HTTP route passes the request through and disables caching', async () => {
  let inputReceived
  let responseHeaders = {}
  const route = loadRoute(
    '../server/api/bookings/availability.get.ts',
    [
      'defineEventHandler',
      'getQuery',
      'setResponseHeader',
      'getInterlakenTourBookingWorkflow',
      'asInterlakenBookingHttpError',
    ],
    [
      (handler) => handler,
      (event) => event.query,
      (_event, name, value) => {
        responseHeaders[name] = value
      },
      () => ({
        checkAvailability: async (input) => {
          inputReceived = input
          return { available: true }
        },
      }),
      (error) => error,
    ]
  )

  assert.deepEqual(
    await route({ query: { tour: input.tourSlug, date: input.date } }),
    {
      available: true,
    }
  )
  assert.deepEqual(inputReceived, {
    tourSlug: input.tourSlug,
    date: input.date,
  })
  assert.equal(responseHeaders['Cache-Control'], 'no-store')
})

test('booking HTTP route sends the request body to the booking command', async () => {
  let inputReceived
  const route = loadRoute(
    '../server/api/bookings/index.post.ts',
    [
      'defineEventHandler',
      'readBody',
      'getInterlakenTourBookingWorkflow',
      'asInterlakenBookingHttpError',
    ],
    [
      (handler) => handler,
      async (event) => event.body,
      () => ({
        book: async (input) => {
          inputReceived = input
          return { booking: { status: 'confirmed' } }
        },
      }),
      (error) => error,
    ]
  )

  const response = await route({ body: input })
  assert.deepEqual(response, { booking: { status: 'confirmed' } })
  assert.deepEqual(inputReceived, input)
})


test('closed dates and closed weekdays prevent public availability and bookings', async () => {
  for (const settings of [
    { ...defaultBookingAvailability(), closedDates: [input.date] },
    { ...defaultBookingAvailability(), openWeekdays: [] },
  ]) {
    const h = harness({ settings })
    assert.equal((await h.workflow.checkAvailability(input)).reason, 'closed')
    await assert.rejects(h.workflow.book(input), (error) => error.statusCode === 409)
    assert.equal(h.events.length, 0)
    assert.equal(h.records.size, 0)
  }
})

test('saved departure time drives availability and the confirmed calendar event', async () => {
  const h = harness({ settings: { ...defaultBookingAvailability(), revision: 3, departureTime: '10:30' } })
  const available = await h.workflow.checkAvailability(input)
  assert.equal(available.startAt, '2026-11-05T10:30:00+01:00')
  const result = await h.workflow.book({ ...input, availabilityRevision: 3 })
  assert.equal(result.booking.departureTime, '10:30')
  assert.equal(h.events[0].startAt, available.startAt)
})


test('a departure in the spring clock-change gap is rejected instead of silently moving the tour', async () => {
  const h = harness({ settings: { ...defaultBookingAvailability(), departureTime: '02:30' } })
  await assert.rejects(h.workflow.checkAvailability({ tourSlug: input.tourSlug, date: '2027-03-28' }), (error) => error.code === 'invalid_departure_time')
  assert.equal(h.events.length, 0)
})


test('checkout cannot silently adopt a departure changed after the guest checked availability', async () => {
  const h = harness()
  assert.equal((await h.workflow.checkAvailability(input)).departureTime, '09:00')
  h.documents.set('businesses/business-1/booking-settings/availability', { ...defaultBookingAvailability(), revision: 1, departureTime: '10:30' })
  await assert.rejects(h.workflow.book(input), (error) => error.code === 'availability_changed')
  assert.equal(h.events.length, 0)
})
