import { defineEventHandler, readBody } from 'h3'
import { respondToKitchenOrder } from '../../../../../kitchen/server/orders/submission'
export default defineEventHandler(async event => respondToKitchenOrder(event, await readBody(event)))
