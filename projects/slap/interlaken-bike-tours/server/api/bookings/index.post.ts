import { notifyLocalTourBooking } from '../../utils/tour-booking-notifications'
import { readBody } from 'h3'
import {
  asInterlakenBookingHttpError,
  getInterlakenTourBookingWorkflow,
} from '../../utils/tour-booking-runtime'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const result = await getInterlakenTourBookingWorkflow().book(body ?? {})
    // Notification failure never turns a confirmed booking into a failed booking.
    await notifyLocalTourBooking(result.booking).catch(() => {
      console.warn('[bookings] Local email notification could not be prepared.')
    })
    return result
  } catch (error) {
    throw asInterlakenBookingHttpError(error)
  }
})
