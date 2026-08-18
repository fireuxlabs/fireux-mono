import { defineEventHandler } from 'h3'
import { listAdminMarketplaceStores } from '../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(listAdminMarketplaceStores)
