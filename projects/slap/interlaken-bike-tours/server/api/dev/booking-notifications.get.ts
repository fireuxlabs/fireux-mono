import { createError, setResponseHeader } from 'h3'
import { listLocalBookingEmails } from '../../utils/tour-booking-notifications'
export default defineEventHandler((event) => {
  if (!import.meta.dev || process.env.BOOKINGS_LOCAL_TEST !== 'true')
    throw createError({ statusCode: 404 })
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return listLocalBookingEmails()
})
