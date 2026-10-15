import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { readKitchenOrderResponseRequest } from '../../../kitchen/server/orders/exchange-request'
export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return readKitchenOrderResponseRequest(event, await readBody(event))
})
