import { defineEventHandler, setResponseHeader } from 'h3'

import { listManagedMarketplaceStores } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return listManagedMarketplaceStores(event)
})
