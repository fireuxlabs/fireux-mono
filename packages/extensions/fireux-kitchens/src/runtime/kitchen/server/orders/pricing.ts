// Concurrent edit — 2026-07-21 16:24 CEST — FireUX Finance pass: derive and validate currency-aware Order pricing snapshots.
// Concurrent edit — 2026-07-21 17:04 CEST — Misebox Nitro finance import fix: use explicit TypeScript server and model imports.
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import {
  addFinancialMoney,
  financialCurrencyMinorUnitDigits,
  financialMoneyFromDecimal,
  requireFinancialMoney,
} from 'fireux-finance/runtime/utils/money'
import type { KitchenOrderPricing } from '../../utils/order.ts'

function requireMinorUnitDigits(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > 6) {
    throw new Error('Order pricing minor_unit_digits must be from 0 to 6.')
  }
  return Number(value)
}

function requirePricingMoney(value: unknown, label: string): FinancialMoney {
  return requireFinancialMoney(value, {
    allowNegative: false,
    label,
  })
}

function assertPricingTotal(pricing: KitchenOrderPricing): void {
  const expectedMinorUnitDigits = financialCurrencyMinorUnitDigits(
    pricing.total.currency_code
  )
  if (pricing.minor_unit_digits !== expectedMinorUnitDigits) {
    throw new Error(
      'Order pricing minor_unit_digits do not match its currency.'
    )
  }
  const expected = addFinancialMoney(
    [pricing.subtotal, pricing.delivery_fee],
    'Order pricing subtotal plus delivery fee'
  )
  if (
    expected.currency_code !== pricing.total.currency_code ||
    expected.amount_minor !== pricing.total.amount_minor
  ) {
    throw new Error(
      'Order pricing total does not equal subtotal plus delivery fee.'
    )
  }
}

export function createKitchenOrderPricing(input: {
  currencyCode: string
  subtotal: number
  deliveryFee: number
  total: number
}): KitchenOrderPricing {
  const minorUnitDigits = financialCurrencyMinorUnitDigits(input.currencyCode)
  const pricing = {
    minor_unit_digits: minorUnitDigits,
    subtotal: financialMoneyFromDecimal({
      amount: input.subtotal,
      currencyCode: input.currencyCode,
      minorUnitDigits,
      allowNegative: false,
      label: 'Order subtotal',
    }),
    delivery_fee: financialMoneyFromDecimal({
      amount: input.deliveryFee,
      currencyCode: input.currencyCode,
      minorUnitDigits,
      allowNegative: false,
      label: 'Order delivery fee',
    }),
    total: financialMoneyFromDecimal({
      amount: input.total,
      currencyCode: input.currencyCode,
      minorUnitDigits,
      allowNegative: false,
      label: 'Order total',
    }),
  }
  assertPricingTotal(pricing)
  return pricing
}

export function requireKitchenOrderPricing(
  value: unknown
): KitchenOrderPricing {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Order pricing snapshot is required.')
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record)
  const expectedKeys = [
    'minor_unit_digits',
    'subtotal',
    'delivery_fee',
    'total',
  ]
  if (
    keys.length !== expectedKeys.length ||
    !expectedKeys.every((key) => keys.includes(key))
  ) {
    throw new Error('Order pricing snapshot has an invalid shape.')
  }

  const pricing = {
    minor_unit_digits: requireMinorUnitDigits(record.minor_unit_digits),
    subtotal: requirePricingMoney(record.subtotal, 'Order subtotal'),
    delivery_fee: requirePricingMoney(
      record.delivery_fee,
      'Order delivery fee'
    ),
    total: requirePricingMoney(record.total, 'Order total'),
  }
  assertPricingTotal(pricing)
  return pricing
}
