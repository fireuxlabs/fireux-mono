import type { MenuOrderTypeConfig } from '../../models/menu/menu.model.ts'
import type {
  KitchenOrderCustomer,
  KitchenOrderPayment,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../models/order.model.ts'

type ResolveMenuOrderPaymentInput = {
  orderType: KitchenOrderType
  orderTypeConfig?: MenuOrderTypeConfig
  customer: KitchenOrderCustomer
  paymentMethod?: KitchenOrderPaymentMethod
  subtotalChf: number
  totalChf: number
}

const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

const money = (value: number) => Math.max(0, Math.round(value * 100) / 100)

const depositAmount = (
  deposit: NonNullable<MenuOrderTypeConfig['fulfilment']>['deposit'],
  input: ResolveMenuOrderPaymentInput
) => {
  if (!deposit) return 0

  const amount = numberValue(deposit.amount)
  if (deposit.type === 'fixed') return amount
  if (deposit.type === 'fixed_per_person') {
    return amount * Math.max(1, Math.floor(numberValue(input.customer.party_size) || 1))
  }
  if (deposit.type === 'percent') {
    return input.totalChf * (amount / 100)
  }

  return 0
}

export const statusAfterPayment = (orderType: KitchenOrderType) =>
  orderType === 'delivery' || orderType === 'pre_order'
    ? 'pending_acceptance'
    : 'open'

export function resolveMenuOrderPayment(
  input: ResolveMenuOrderPaymentInput
): KitchenOrderPayment {
  const fulfilment = input.orderTypeConfig?.fulfilment
  const methods = fulfilment?.payment_methods || []
  const deposit = fulfilment?.deposit
  const method = input.paymentMethod || methods[0]

  if (deposit) {
    const amount = money(depositAmount(deposit, input))

    if (amount > 0) {
      return {
        required: true,
        status: 'requires_payment',
        method: 'deposit',
        amount_chf: amount,
        currency_code: deposit.currency_code || 'CHF',
        reason: deposit.label || 'Deposit',
      }
    }
  }

  if (method === 'online_card' && methods.includes('online_card')) {
    const amount = money(input.totalChf)

    if (amount > 0) {
      return {
        required: true,
        status: 'requires_payment',
        method: 'online_card',
        amount_chf: amount,
        currency_code: 'CHF',
        reason: input.orderType === 'delivery'
          ? 'Delivery order payment'
          : 'Order payment',
      }
    }
  }

  return {
    required: false,
    status: 'not_required',
    ...(method ? { method } : {}),
    currency_code: 'CHF',
  }
}
