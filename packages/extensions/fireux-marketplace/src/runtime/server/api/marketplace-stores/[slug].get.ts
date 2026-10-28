import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

import { readMarketplaceStoreDetail } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readMarketplaceStoreDetail(event, getRouterParam(event, 'slug'))
})
