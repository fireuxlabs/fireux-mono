import { createError } from 'h3'
import type {
  KitchenOrderChannel,
  KitchenOrderType,
} from '../../../models/kitchen/order.model.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'

const text = (value: unknown) => String(value ?? '').trim()

export function readMenuOrderChannel(
  value: unknown,
  orderType: KitchenOrderType
): KitchenOrderChannel {
  const strategy = menuOrderTypeStrategy(orderType)
  const channel = (text(value) || strategy.defaultChannel) as KitchenOrderChannel
  if (!strategy.allowedChannels.includes(channel)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order channel does not match this order type.',
    })
  }

  return channel
}
