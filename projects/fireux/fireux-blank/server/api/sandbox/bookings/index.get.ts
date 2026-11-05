import { createError, setResponseHeader } from 'h3'
import { bookingSandbox } from '../../../utils/booking-sandbox-calendar'

export default defineEventHandler((event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found.' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { bookings: bookingSandbox.listBookings() }
})
