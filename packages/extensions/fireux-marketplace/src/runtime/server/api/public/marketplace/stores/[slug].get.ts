import { defineEventHandler, getRouterParam } from 'h3'
import { getPublicMarketplaceStore } from '../../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) =>
  getPublicMarketplaceStore(event, getRouterParam(event, 'slug'))
)
