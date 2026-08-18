import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { createMarketplaceOffer } from '../../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(async (event) =>
  createMarketplaceOffer(
    event,
    getRouterParam(event, 'storeId'),
    await readBody(event)
  )
)
