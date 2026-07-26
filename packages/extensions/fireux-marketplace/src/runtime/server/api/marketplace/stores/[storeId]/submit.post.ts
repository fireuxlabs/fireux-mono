import { defineEventHandler, getRouterParam } from 'h3'
import { submitMarketplaceStore } from '../../../../marketplace/authority'

export default defineEventHandler(event =>
  submitMarketplaceStore(event, getRouterParam(event, 'storeId'))
)
