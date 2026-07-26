import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { MarketplaceStoreMemberIntent } from '../../../../../../models/marketplace-api.model'
import { mutateMarketplaceStoreMember } from '../../../../../marketplace/authority'

export default defineEventHandler(async event =>
  mutateMarketplaceStoreMember(
    event,
    getRouterParam(event, 'storeId'),
    await readBody<MarketplaceStoreMemberIntent>(event)
  )
)
