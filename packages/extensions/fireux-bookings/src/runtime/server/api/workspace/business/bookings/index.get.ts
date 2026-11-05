import { readBusinessBookings } from '../../../../business/management'
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const query = getQuery(event)
  return readBusinessBookings(event, query.businessId, query.cursor)
})
