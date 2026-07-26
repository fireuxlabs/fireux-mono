import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { MarketplaceOfferTransitionIntent } from '../../../../../../../models/marketplace-api.model'
import { transitionMarketplaceOffer } from '../../../../../../marketplace/authority'

export default defineEventHandler(async event =>
  transitionMarketplaceOffer(
    event,
    getRouterParam(event, 'storeId'),
    getRouterParam(event, 'offerId'),
    await readBody<MarketplaceOfferTransitionIntent>(event)
  )
)
