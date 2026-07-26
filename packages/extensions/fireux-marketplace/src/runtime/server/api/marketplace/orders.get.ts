import { defineEventHandler, getQuery } from 'h3'
import { listMarketplaceOrders } from '../../marketplace/authority'

export default defineEventHandler(event => {
  const query = getQuery(event)
  return listMarketplaceOrders(event, query.view, query.storeId)
})
