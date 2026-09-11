import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { readMarketplaceStoreDirectoryPage } from '../../../marketplace-store/server/core/capabilities'

export default defineLiveReadHandler(readMarketplaceStoreDirectoryPage)
