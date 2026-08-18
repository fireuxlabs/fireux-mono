import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { patchMarketplaceOffer } from '../../../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(async (event) =>
  patchMarketplaceOffer(
    event,
    getRouterParam(event, 'storeId'),
    getRouterParam(event, 'offerId'),
    await readBody(event)
  )
)
