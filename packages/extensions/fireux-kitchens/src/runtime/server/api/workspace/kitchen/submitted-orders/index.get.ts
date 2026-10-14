import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { listKitchenSubmittedOrders } from '../../../../../kitchen/server/orders/submission'
export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return listKitchenSubmittedOrders(event, getQuery(event).kitchenId)
})
