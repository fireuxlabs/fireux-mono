import { createError } from 'h3'
import type { MenuOrderTypeConfig } from '../../../models/kitchen/menu/menu.model.ts'
import type {
  KitchenOrderCustomer,
  KitchenOrderPayment,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../models/kitchen/order.model.ts'
import { normalizePaymentMethod, text } from './order-request.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'

type ResolveMenuOrderPaymentMethodInput = {
  orderTypeConfig?: MenuOrderTypeConfig
  requestedPaymentMethod: unknown
}

type ValidateMenuOrderDepositPolicyInput = {
  orderTypeConfig?: MenuOrderTypeConfig
  customer: KitchenOrderCustomer
  currencyCode: string
}

type ResolveMenuOrderPaymentInput = {
  orderType: KitchenOrderType
  orderTypeConfig?: MenuOrderTypeConfig
  customer: KitchenOrderCustomer
  currencyCode: string
  paymentMethod?: KitchenOrderPaymentMethod
  subtotalChf: number
  totalChf: number
}

const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

const money = (value: number) => Math.max(0, Math.round(value * 100) / 100)

export function resolveMenuOrderPaymentMethod(
  input: ResolveMenuOrderPaymentMethodInput
): KitchenOrderPaymentMethod | undefined {
  const configuredPaymentMethods =
    input.orderTypeConfig?.fulfilment?.payment_methods || []
  const allowedPaymentMethods: KitchenOrderPaymentMethod[] =
    input.orderTypeConfig?.fulfilment?.deposit
      ? ['deposit']
      : configuredPaymentMethods
  const requestedPaymentMethod = normalizePaymentMethod(
    input.requestedPaymentMethod,
    allowedPaymentMethods
  )
  const paymentMethod = requestedPaymentMethod ||
    (input.orderTypeConfig?.fulfilment?.deposit
      ? 'deposit'
      : allowedPaymentMethods.length === 1
        ? allowedPaymentMethods[0]
        : undefined)

  if (allowedPaymentMethods.length && !paymentMethod) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a payment method.',
    })
  }

  return paymentMethod
}

export function validateMenuOrderDepositPolicy(
  input: ValidateMenuOrderDepositPolicyInput
) {
  const depositPolicy = input.orderTypeConfig?.fulfilment?.deposit
  const depositCurrencyCode = text(depositPolicy?.currency_code).toUpperCase()

  if (
    depositCurrencyCode &&
    depositCurrencyCode !== input.currencyCode.toUpperCase()
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deposit currency must match the kitchen currency.',
    })
  }
  if (
    depositPolicy?.type === 'fixed_per_person' &&
    !Number(input.customer.party_size)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Party size is required for this deposit.',
    })
  }
}

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
  menuOrderTypeStrategy(orderType).requiresAcceptance
    ? 'pending_acceptance'
    : 'open'

export function resolveMenuOrderPayment(
  input: ResolveMenuOrderPaymentInput
): KitchenOrderPayment {
  const fulfilment = input.orderTypeConfig?.fulfilment
  const methods: KitchenOrderPaymentMethod[] = ['online_card']
  const deposit = fulfilment?.deposit
  const method = input.paymentMethod
  const currencyCode = input.currencyCode.trim().toUpperCase()

  if (!currencyCode) {
    throw new Error('Kitchen currency code is required')
  }

  if (deposit) {
    const amount = money(depositAmount(deposit, input))

    if (amount > 0) {
      return {
        required: true,
        status: 'requires_payment',
        method: 'deposit',
        amount_chf: amount,
        currency_code: currencyCode,
        reason: deposit.label || 'Deposit',
      }
    }
  }

  if (!method) {
    return {
      required: false,
      status: 'not_required',
      currency_code: currencyCode,
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
        currency_code: currencyCode,
        reason: menuOrderTypeStrategy(input.orderType).resolvesDelivery
          ? 'Delivery order payment'
          : 'Order payment',
      }
    }
  }

  return {
    required: false,
    status: 'not_required',
    ...(method ? { method } : {}),
    currency_code: currencyCode,
  }
}
