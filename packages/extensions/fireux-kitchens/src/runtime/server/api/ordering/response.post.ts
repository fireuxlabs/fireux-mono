import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { readKitchenOrderResponse } from '../../../kitchen/server/orders/submission'
export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return readKitchenOrderResponse(event, await readBody(event))
})
