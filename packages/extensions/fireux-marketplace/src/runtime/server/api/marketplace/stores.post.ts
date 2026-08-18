import { defineEventHandler, readBody } from 'h3'
import { createMarketplaceStore } from '../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(async (event) =>
  createMarketplaceStore(event, await readBody(event))
)
