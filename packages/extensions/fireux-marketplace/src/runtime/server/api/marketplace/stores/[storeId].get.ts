import { defineEventHandler, getRouterParam } from 'h3'
import { getManagedMarketplaceStore } from '../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) =>
  getManagedMarketplaceStore(event, getRouterParam(event, 'storeId'))
)
