import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam } from 'h3'
import { readMarketplaceStoreDetail } from '../../../marketplace-store/server/core/capabilities'

export default defineLiveReadHandler((event) =>
  readMarketplaceStoreDetail(event, getRouterParam(event, 'slug'))
)
