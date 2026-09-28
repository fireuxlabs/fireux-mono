import { createError } from 'h3'
import type {
  KitchenOrder,
  KitchenOrderPaymentMethod,
} from '../../../kitchen/utils/order.ts'
import type { MenuOrderTypeConfig } from '../../models/menu-ordering.model'
import { resolveMenuOrderPayment } from './payment.ts'

const deferred = [
  'pay_later',
  'cash',
  'card_at_pickup',
  'card_to_driver',
  'room_charge',
]

export function orderPaymentChoices(
  order: KitchenOrder,
  onlineAvailable: boolean
): KitchenOrderPaymentMethod[] {
  if (order.payment?.flow !== 'confirmation_first') return []
  const policy = order.fulfilment_policy || {}
  if (policy.deposit) return onlineAvailable ? ['deposit'] : []
  const configured = Array.isArray(policy.payment_methods)
    ? policy.payment_methods
    : []
  const methods = configured.filter(
    (method): method is KitchenOrderPaymentMethod =>
      typeof method === 'string' &&
      (deferred.includes(method) ||
        (method === 'online_card' && onlineAvailable))
  )
  if (
    methods.some((method) => deferred.includes(method)) &&
    !methods.includes('pay_later')
  )
    methods.push('pay_later')
  return [...new Set(methods)]
}

export function orderPaymentReleaseStatus(
  order: Pick<KitchenOrder, 'order_type' | 'collection'>
) {
  return order.order_type === 'collection' &&
    order.collection?.mode === 'scheduled'
    ? ('scheduled' as const)
    : ('awaiting_preparation' as const)
}

export function buildOrderPaymentChoice(
  order: KitchenOrder,
  method: unknown,
  onlineAvailable: boolean
): Partial<KitchenOrder> {
  if (order.payment?.flow !== 'confirmation_first')
    throw createError({
      statusCode: 409,
      statusMessage: 'This order uses its original payment flow.',
    })
  if (
    order.payment.method === method &&
    [
      'pending_payment',
      'scheduled',
      'awaiting_preparation',
      'accepted',
      'ready',
      'completed',
    ].includes(order.status)
  )
    return {}
  if (!['awaiting_payment_choice', 'pending_payment'].includes(order.status))
    throw createError({
      statusCode: 409,
      statusMessage: 'Wait for Kitchen confirmation before choosing payment.',
    })
  if (order.payment.status === 'paid')
    throw createError({
      statusCode: 409,
      statusMessage: 'This order has already been paid.',
    })
  if (
    !orderPaymentChoices(order, onlineAvailable).includes(
      method as KitchenOrderPaymentMethod
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose an available payment method.',
    })
  // The command must expire any open checkout before replacing its method.
  if (order.payment.stripe_checkout_session_id)
    throw createError({
      statusCode: 409,
      statusMessage:
        'Close the current payment attempt before changing method.',
    })
  const digits = order.pricing.minor_unit_digits
  const payment = resolveMenuOrderPayment({
    orderType: order.order_type,
    orderTypeConfig: {
      type: order.order_type,
      fulfilment: order.fulfilment_policy,
    } as MenuOrderTypeConfig,
    customer: order.customer || {},
    currencyCode: order.pricing.total.currency_code,
    paymentMethod: method as KitchenOrderPaymentMethod,
    subtotalChf: order.pricing.subtotal.amount_minor / 10 ** digits,
    totalChf: order.pricing.total.amount_minor / 10 ** digits,
  })
  const release = orderPaymentReleaseStatus(order)
  return {
    status: payment.required ? 'pending_payment' : release,
    payment: { ...payment, flow: 'confirmation_first', resume_status: release },
  }
}
