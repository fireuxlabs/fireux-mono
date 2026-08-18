import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { MarketplaceStoreMemberIntent } from '../../../../../../marketplace-store/models/marketplace-api.model.ts'
import { mutateMarketplaceStoreMember } from '../../../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(async (event) =>
  mutateMarketplaceStoreMember(
    event,
    getRouterParam(event, 'storeId'),
    await readBody<MarketplaceStoreMemberIntent>(event)
  )
)
