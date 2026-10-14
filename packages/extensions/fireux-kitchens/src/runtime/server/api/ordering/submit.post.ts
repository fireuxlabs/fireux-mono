import { defineEventHandler, readBody } from 'h3'
import { submitKitchenOrderRequest } from '../../../kitchen/server/orders/submit-request'
export default defineEventHandler(async (event) =>
  submitKitchenOrderRequest(event, await readBody(event))
)
