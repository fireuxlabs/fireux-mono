import { createError, readBody } from 'h3'
import { bookingSandbox } from '../../../utils/booking-sandbox-calendar'
import { bookingSandboxHttpError } from '../../../utils/booking-sandbox'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found.' })
  }

  try {
    const booking = await bookingSandbox.createBooking(await readBody(event))
    return { booking }
  } catch (error) {
    throw bookingSandboxHttpError(error)
  }
})
