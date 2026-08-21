import { defineEventHandler, getRouterParam } from 'h3'
import { readMarketplaceStoreDetail } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) =>
  readMarketplaceStoreDetail(event, getRouterParam(event, 'slug'))
)
