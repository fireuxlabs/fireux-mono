import { createError } from 'h3'
import type {
  KitchenOrderChannel,
  KitchenOrderType,
} from '../../../models/kitchen/order.model.ts'
import { kitchenOrderIntakePolicy } from '../../../models/kitchen/order.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

export function readMenuOrderChannel(
  value: unknown,
  orderType: KitchenOrderType
): KitchenOrderChannel {
  const policy = kitchenOrderIntakePolicy(orderType)
  const channel = (text(value) || policy.default_channel) as KitchenOrderChannel
  if (!policy.channels.includes(channel)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order channel does not match this order type.',
    })
  }

  return channel
}
