import { defineEventHandler, readBody } from 'h3'
import { createMarketplaceStore } from '../../marketplace/authority'

export default defineEventHandler(async event =>
  createMarketplaceStore(event, await readBody(event))
)
