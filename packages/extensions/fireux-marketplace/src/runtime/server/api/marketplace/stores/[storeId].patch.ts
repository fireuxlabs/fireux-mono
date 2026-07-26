import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { patchMarketplaceStore } from '../../../marketplace/authority'

export default defineEventHandler(async event =>
  patchMarketplaceStore(
    event,
    getRouterParam(event, 'storeId'),
    await readBody(event)
  )
)
