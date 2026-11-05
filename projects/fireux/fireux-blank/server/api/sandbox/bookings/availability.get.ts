import { createError, getQuery, setResponseHeader } from 'h3'
import { bookingSandbox } from '../../../utils/booking-sandbox-calendar'
import { bookingSandboxHttpError } from '../../../utils/booking-sandbox'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found.' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')
  const query = getQuery(event)
  try {
    return await bookingSandbox.checkAvailability(query.startAt, query.endAt)
  } catch (error) {
    throw bookingSandboxHttpError(error)
  }
})
