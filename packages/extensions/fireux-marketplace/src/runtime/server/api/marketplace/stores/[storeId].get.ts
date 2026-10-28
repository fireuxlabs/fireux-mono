import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { getManagedMarketplaceStore } from '../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return getManagedMarketplaceStore(event, getRouterParam(event, 'storeId'))
})
