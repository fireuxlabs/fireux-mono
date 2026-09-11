import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam } from 'h3'
import { getManagedMarketplaceStore } from '../../../../marketplace-store/server/core/capabilities'

export default defineLiveReadHandler((event) =>
  getManagedMarketplaceStore(event, getRouterParam(event, 'storeId'))
)
