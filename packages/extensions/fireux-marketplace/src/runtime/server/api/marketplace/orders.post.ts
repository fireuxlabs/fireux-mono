import { defineEventHandler, readBody } from 'h3'
import { createMarketplaceOrder } from '../../marketplace/authority'

export default defineEventHandler(async event =>
  createMarketplaceOrder(event, await readBody(event))
)
