import { defineEventHandler, getRouterParam } from 'h3'
import { getManagedMarketplaceStore } from '../../../marketplace/authority'

export default defineEventHandler(event =>
  getManagedMarketplaceStore(event, getRouterParam(event, 'storeId'))
)
