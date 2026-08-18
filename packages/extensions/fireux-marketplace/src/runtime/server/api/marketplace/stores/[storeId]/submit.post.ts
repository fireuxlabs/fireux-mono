import { defineEventHandler, getRouterParam } from 'h3'
import { submitMarketplaceStore } from '../../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) =>
  submitMarketplaceStore(event, getRouterParam(event, 'storeId'))
)
