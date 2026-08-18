import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { MarketplaceOfferTransitionIntent } from '../../../../../../../marketplace-store/models/marketplace-api.model.ts'
import { transitionMarketplaceOffer } from '../../../../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(async (event) =>
  transitionMarketplaceOffer(
    event,
    getRouterParam(event, 'storeId'),
    getRouterParam(event, 'offerId'),
    await readBody<MarketplaceOfferTransitionIntent>(event)
  )
)
