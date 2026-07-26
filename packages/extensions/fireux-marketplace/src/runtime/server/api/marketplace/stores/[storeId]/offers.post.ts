import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { createMarketplaceOffer } from '../../../../marketplace/authority'

export default defineEventHandler(async event =>
  createMarketplaceOffer(
    event,
    getRouterParam(event, 'storeId'),
    await readBody(event)
  )
)
