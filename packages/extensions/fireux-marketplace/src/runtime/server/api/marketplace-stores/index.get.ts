import { defineEventHandler, setResponseHeader } from 'h3'

import { readMarketplaceStoreDirectoryPage } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readMarketplaceStoreDirectoryPage(event)
})
