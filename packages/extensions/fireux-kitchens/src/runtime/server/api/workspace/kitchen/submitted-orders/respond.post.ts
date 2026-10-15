import { defineEventHandler, readBody } from 'h3'
import { respondToKitchenOrderRequest } from '../../../../../kitchen/server/orders/exchange-request'
export default defineEventHandler(async event => respondToKitchenOrderRequest(event, await readBody(event)))
