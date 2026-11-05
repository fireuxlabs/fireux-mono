import { readBody } from 'h3'
import {
  asInterlakenBookingHttpError,
  getInterlakenTourBookingWorkflow,
} from '../../utils/tour-booking-runtime'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    return await getInterlakenTourBookingWorkflow().book(body ?? {})
  } catch (error) {
    throw asInterlakenBookingHttpError(error)
  }
})
