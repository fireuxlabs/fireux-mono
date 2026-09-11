import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { listManagedMarketplaceStores } from '../../../marketplace-store/server/core/capabilities'

export default defineLiveReadHandler(listManagedMarketplaceStores)
