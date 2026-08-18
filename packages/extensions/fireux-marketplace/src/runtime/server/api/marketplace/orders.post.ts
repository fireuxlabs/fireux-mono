import { defineEventHandler, readBody } from 'h3'
import { createMarketplaceOrder } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(async (event) =>
  createMarketplaceOrder(event, await readBody(event))
)
