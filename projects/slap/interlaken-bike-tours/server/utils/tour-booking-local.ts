import { defaultBookingAvailability } from 'fireux-bookings/runtime/utils/availability'
import {
  createInterlakenTourBookingWorkflow,
  InterlakenTourBookingError,
  type InterlakenTourBookingRecord,
} from './tour-booking'

/** Test dependencies for the real tour workflow; no external storage or Calendar. */
export function createLocalTourBookingWorkflow() {
  const records = new Map<string, InterlakenTourBookingRecord>()
  const events = new Map<string, { start: string; end: string }>()
  return createInterlakenTourBookingWorkflow({
    createId: () => `local-${crypto.randomUUID()}`,
    store: {
      readAvailability: async () => defaultBookingAvailability(),
      isDateReserved: async (date) => records.has(date),
      reserve: async (date, record) => {
        if (records.has(date))
          throw new InterlakenTourBookingError(
            409,
            'slot_unavailable',
            'That date is already booked.'
          )
        records.set(date, { ...record })
      },
      confirm: async (date, id, eventId) => {
        const record = records.get(date)
        if (!record || record.id !== id || !events.has(eventId))
          throw new Error('Local reservation could not be confirmed.')
        record.status = 'confirmed'
      },
      release: async (date, id) => {
        if (records.get(date)?.id === id) records.delete(date)
      },
    },
    calendar: {
      readBusy: async () => [...events.values()],
      createEvent: async (input) => {
        const id = `local-event-${input.bookingReference}`
        events.set(id, { start: input.startAt, end: input.endAt })
        return { id }
      },
    },
  })
}

let workflow: ReturnType<typeof createLocalTourBookingWorkflow> | undefined
export function getLocalTourBookingWorkflow() {
  return (workflow ??= createLocalTourBookingWorkflow())
}
