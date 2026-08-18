import { defineEventHandler } from 'h3'
import { listPublicMarketplaceStores } from '../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(listPublicMarketplaceStores)
