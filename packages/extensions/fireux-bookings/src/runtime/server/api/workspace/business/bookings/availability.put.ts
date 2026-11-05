import { updateBusinessBookingAvailability } from '../../../../business/management'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return updateBusinessBookingAvailability(event, await readBody(event))
})
