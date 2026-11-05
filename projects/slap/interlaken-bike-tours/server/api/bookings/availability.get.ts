import { getQuery, setResponseHeader } from 'h3'
import {
  asInterlakenBookingHttpError,
  getInterlakenTourBookingWorkflow,
} from '../../utils/tour-booking-runtime'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  try {
    const query = getQuery(event)
    return await getInterlakenTourBookingWorkflow().checkAvailability({
      tourSlug: query.tour,
      date: query.date,
    })
  } catch (error) {
    throw asInterlakenBookingHttpError(error)
  }
})
