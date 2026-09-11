import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { listAdminMarketplaceStores } from '../../../../marketplace-store/server/core/capabilities'

export default defineLiveReadHandler(listAdminMarketplaceStores)
