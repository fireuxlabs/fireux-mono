import { defineEventHandler } from 'h3'
import { readMarketplaceStoreDirectoryPage } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(readMarketplaceStoreDirectoryPage)
