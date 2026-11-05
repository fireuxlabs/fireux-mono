import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const lifecycleSource = readFileSync(
  new URL(
    '../../../../packages/extensions/fireux-bookings/src/runtime/server/booking.ts',
    import.meta.url
  ),
  'utf8'
).replace(/^export /gm, '')
const lifecycle = compileFunction(
  `${stripTypeScriptTypes(lifecycleSource)}; return { BookingError, confirmBooking }`
)()

const sandboxSource = readFileSync(
  new URL('../server/utils/booking-sandbox.ts', import.meta.url),
  'utf8'
)
  .replace(/^import \{ createError \} from ['"]h3['"]\r?\n/m, '')
  .replace(/^import type \{[\s\S]*?\} from ['"][^'"]+['"]\r?\n/gm, '')
  .replace(/^export /gm, '')
const { createBookingSandbox } = compileFunction(
  `${stripTypeScriptTypes(sandboxSource)}; return { createBookingSandbox }`,
  ['BookingError', 'confirmBooking', 'createError']
)(lifecycle.BookingError, lifecycle.confirmBooking, (error) => error)

const range = {
  startAt: '2026-12-01T10:00:00.000Z',
  endAt: '2026-12-01T11:00:00.000Z',
}
const bookingDetails = {
  serviceName: 'Sandbox activity',
  guestName: 'Sandbox guest',
  guestEmail: 'guest@example.test',
  groupSize: 2,
}

function createHarness() {
  const events = []
  let eventCount = 0
  const sandbox = createBookingSandbox(
    {
      connection: { calendarId: 'fake-calendar' },
      readBusy: async (_connection, query) =>
        events
          .filter(
            (event) =>
              Date.parse(event.start.dateTime) < Date.parse(query.timeMax) &&
              Date.parse(event.end.dateTime) > Date.parse(query.timeMin)
          )
          .map((event) => ({
            start: event.start.dateTime,
            end: event.end.dateTime,
          })),
      createEvent: async (_connection, draft) => {
        const id = `fake-event-${++eventCount}`
        events.push(structuredClone(draft))
        return { id }
      },
      reset: () => {
        events.length = 0
        eventCount = 0
      },
    },
    () => `sandbox-booking-${eventCount + 1}`
  )
  return { events, sandbox }
}

test('sandbox confirms a booking through the shared lifecycle and fake provider', async () => {
  const { events, sandbox } = createHarness()
  assert.equal((await sandbox.checkAvailability(range.startAt, range.endAt)).available, true)

  const booking = await sandbox.createBooking({ ...bookingDetails, ...range })

  assert.equal(booking.status, 'confirmed')
  assert.equal(booking.calendarEventId, 'fake-event-1')
  assert.equal(booking.serviceName, bookingDetails.serviceName)
  assert.equal(booking.guestEmail, bookingDetails.guestEmail)
  assert.equal(booking.groupSize, bookingDetails.groupSize)
  assert.match(events[0].description, /guest@example\.test/)
  assert.match(events[0].description, /Group size: 2/)
  assert.equal(events.length, 1)
  assert.equal((await sandbox.checkAvailability(range.startAt, range.endAt)).available, false)
  assert.equal(sandbox.listBookings().length, 1)
})

test('sandbox rejects an overlapping booking and reset clears its in-memory calendar', async () => {
  const { events, sandbox } = createHarness()
  await sandbox.createBooking({
    ...bookingDetails,
    guestName: 'First guest',
    ...range,
  })

  await assert.rejects(
    sandbox.createBooking({
      ...bookingDetails,
      guestName: 'Second guest',
      ...range,
    }),
    (error) => error.statusCode === 409
  )
  assert.equal(events.length, 1)

  sandbox.reset()
  assert.equal(sandbox.listBookings().length, 0)
  assert.equal(events.length, 0)
  assert.equal((await sandbox.checkAvailability(range.startAt, range.endAt)).available, true)
})

test('sandbox validates customer and group inputs before creating an event', async () => {
  const { events, sandbox } = createHarness()

  await assert.rejects(
    sandbox.createBooking({ ...bookingDetails, guestEmail: 'invalid', ...range }),
    (error) => error.statusCode === 400 && error.code === 'invalid_email'
  )
  await assert.rejects(
    sandbox.createBooking({ ...bookingDetails, groupSize: 51, ...range }),
    (error) => error.statusCode === 400 && error.code === 'invalid_group_size'
  )
  assert.equal(events.length, 0)
})
