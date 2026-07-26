import { defineEventHandler, getRouterParam } from 'h3'
import { getPublicMarketplaceStore } from '../../../../marketplace/authority'

export default defineEventHandler(event =>
  getPublicMarketplaceStore(event, getRouterParam(event, 'slug'))
)
