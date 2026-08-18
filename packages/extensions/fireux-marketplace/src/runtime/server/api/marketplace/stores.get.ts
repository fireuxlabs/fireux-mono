import { defineEventHandler } from 'h3'
import { listManagedMarketplaceStores } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(listManagedMarketplaceStores)
