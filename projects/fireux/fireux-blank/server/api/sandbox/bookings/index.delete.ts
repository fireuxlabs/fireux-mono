import { createError } from 'h3'
import { bookingSandbox } from '../../../utils/booking-sandbox-calendar'

export default defineEventHandler(() => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found.' })
  }

  bookingSandbox.reset()
  return { reset: true }
})
