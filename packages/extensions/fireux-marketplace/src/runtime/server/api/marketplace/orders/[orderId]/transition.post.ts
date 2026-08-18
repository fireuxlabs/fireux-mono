import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { MarketplaceOrderTransitionIntent } from '../../../../../marketplace-store/models/marketplace-api.model.ts'
import { transitionMarketplaceOrder } from '../../../../../marketplace-store/server/core/capabilities'

export default defineEventHandler(async (event) =>
  transitionMarketplaceOrder(
    event,
    getRouterParam(event, 'orderId'),
    await readBody<MarketplaceOrderTransitionIntent>(event)
  )
)
