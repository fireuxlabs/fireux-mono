import type {
  KitchenOrderCustomer,
  KitchenOrderType,
} from '../../kitchen/utils/order.ts'
import type { KitchenOrderDepositPolicy } from '../../kitchen/models/ordering.model'

const text = (value: unknown) => String(value ?? '').trim()

export const menuOrderDepositLabel = (
  policy: KitchenOrderDepositPolicy | null | undefined,
  fallbackCurrencyCode: string
) => {
  if (
    !policy ||
    !Number.isFinite(Number(policy.amount)) ||
    Number(policy.amount) <= 0
  ) {
    return ''
  }
  if (policy.type === 'percent') return `${Number(policy.amount)}% deposit`

  const currencyCode = text(
    policy.currency_code || fallbackCurrencyCode
  ).toUpperCase()
  if (!currencyCode) return ''
  const amount = new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(policy.amount))

  return policy.type === 'fixed_per_person'
    ? `${amount} deposit per person`
    : `${amount} deposit`
}

export const menuOrderBasketActionLabel = (type: KitchenOrderType) => {
  const labels: Record<KitchenOrderType, string> = {
    delivery: 'Organise delivery',
    collection: 'Organise collection',
    eat_in: 'Join order queue',
    takeaway: 'Join order queue',
    pre_order: 'Organise pre-order',
    room_service: 'Organise room service',
    dine_in: 'Send to kitchen',
  }

  return labels[type] || 'Place order'
}

export const menuOrderFunnelTitle = (type: KitchenOrderType) => {
  const labels: Record<KitchenOrderType, string> = {
    delivery: 'Organise delivery',
    collection: 'Organise collection',
    eat_in: 'Join order queue',
    takeaway: 'Join order queue',
    pre_order: 'Organise pre-order',
    room_service: 'Organise room service',
    dine_in: 'Send to kitchen',
  }

  return labels[type] || 'Send order'
}

export const menuOrderSubmitLabel = (type: KitchenOrderType) => {
  const labels: Record<KitchenOrderType, string> = {
    delivery: 'Send delivery order',
    collection: 'Send collection order',
    eat_in: 'Send eat-here order',
    takeaway: 'Send take-away order',
    pre_order: 'Send pre-order',
    room_service: 'Send room service order',
    dine_in: 'Send table order',
  }

  return labels[type] || 'Send order'
}

export const cleanKitchenOrderCustomer = (
  customer: KitchenOrderCustomer
): KitchenOrderCustomer =>
  Object.fromEntries(
    Object.entries(customer).filter(([, value]) => text(value))
  )
