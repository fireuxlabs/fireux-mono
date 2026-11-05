import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { createError } from 'h3'
import {
  createInterlakenTourBookingWorkflow,
  InterlakenTourBookingError,
} from './tour-booking'
import { createInterlakenTourBookingStore } from './tour-booking-store'
import {
  createInterlakenTourCalendarEvent,
  interlakenTourCalendarConnection,
  readInterlakenTourCalendarBusy,
} from './tour-calendar'

export function getInterlakenTourBookingWorkflow() {
  const businessId = requireFirestoreDocumentId(process.env.BOOKINGS_BUSINESS_ID, 'Booking Business id')
  const connection = interlakenTourCalendarConnection()
  const store = createInterlakenTourBookingStore(businessId)
  return createInterlakenTourBookingWorkflow({
    store,
    calendar: {
      readBusy: (startAt, endAt) =>
        readInterlakenTourCalendarBusy(connection, startAt, endAt),
      createEvent: (input) =>
        createInterlakenTourCalendarEvent(connection, input),
    },
  })
}

export function asInterlakenBookingHttpError(error: unknown) {
  if (error instanceof InterlakenTourBookingError) {
    return createError({
      statusCode: error.statusCode,
      statusMessage: error.message,
    })
  }
  return createError({
    statusCode: 503,
    statusMessage: 'The booking service is temporarily unavailable.',
  })
}
