import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { listKitchenSubmittedOrdersRequest } from '../../../../../kitchen/server/orders/exchange-request'
export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return listKitchenSubmittedOrdersRequest(event, getQuery(event).kitchenId)
})
