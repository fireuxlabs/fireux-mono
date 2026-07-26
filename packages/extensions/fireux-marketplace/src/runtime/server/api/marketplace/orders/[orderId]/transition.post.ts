import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { MarketplaceOrderTransitionIntent } from '../../../../../models/marketplace-api.model'
import { transitionMarketplaceOrder } from '../../../../marketplace/authority'

export default defineEventHandler(async event =>
  transitionMarketplaceOrder(
    event,
    getRouterParam(event, 'orderId'),
    await readBody<MarketplaceOrderTransitionIntent>(event)
  )
)
