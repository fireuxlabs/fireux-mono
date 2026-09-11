import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { listMarketplaceOrders } from '../../../marketplace-store/server/core/capabilities'

export default defineLiveReadHandler((event) => {
  const query = getQuery(event)
  return listMarketplaceOrders(event, query.view, query.storeId)
})
