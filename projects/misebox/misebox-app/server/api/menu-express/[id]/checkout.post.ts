import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { startCheckout } from '../../../menu-express/payment'
export default defineEventHandler(async (event) =>
  startCheckout(
    event,
    getRouterParam(event, 'id'),
    (await readBody(event)).token
  )
)
