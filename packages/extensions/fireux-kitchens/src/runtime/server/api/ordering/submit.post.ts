import { defineEventHandler, readBody } from 'h3'
import { submitKitchenOrder } from '../../../kitchen/server/orders/submission'
export default defineEventHandler(async event => submitKitchenOrder(event, await readBody(event)))
