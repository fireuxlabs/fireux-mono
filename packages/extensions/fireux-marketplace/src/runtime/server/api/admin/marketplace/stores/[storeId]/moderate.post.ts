import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { MarketplaceStoreModerationIntent } from '../../../../../../models/marketplace-api.model'
import { moderateMarketplaceStore } from '../../../../../marketplace/authority'

export default defineEventHandler(async event =>
  moderateMarketplaceStore(
    event,
    getRouterParam(event, 'storeId'),
    await readBody<MarketplaceStoreModerationIntent>(event)
  )
)
