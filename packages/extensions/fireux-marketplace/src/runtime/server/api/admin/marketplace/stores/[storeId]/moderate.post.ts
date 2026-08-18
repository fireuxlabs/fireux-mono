import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { MarketplaceStoreModerationIntent } from '../../../../../../marketplace-store/models/marketplace-api.model.ts'
import { moderateMarketplaceStore } from '../../../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(async (event) =>
  moderateMarketplaceStore(
    event,
    getRouterParam(event, 'storeId'),
    await readBody<MarketplaceStoreModerationIntent>(event)
  )
)
