import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { listMarketplaceOrders } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const query = getQuery(event)
  return listMarketplaceOrders(event, query.view, query.storeId)
})
