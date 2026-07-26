import { defineEventHandler } from 'h3'
import { listManagedMarketplaceStores } from '../../marketplace/authority'

export default defineEventHandler(listManagedMarketplaceStores)
