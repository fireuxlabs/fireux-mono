// Concurrent edit — 2026-07-21 16:39 CEST — FireUX Finance pass: enforce ISO minor-unit exponents in decimal conversion.
import type { FinancialMoney } from '../models/money.model'

export type FinancialMoneyValidationOptions = {
  allowNegative?: boolean
  allowZero?: boolean
  label?: string
}

export type FinancialMoneyFormatOptions = {
  locales?: Intl.LocalesArgument
  currencyDisplay?: Intl.NumberFormatOptions['currencyDisplay']
  currencySign?: Intl.NumberFormatOptions['currencySign']
  useGrouping?: Intl.NumberFormatOptions['useGrouping']
}

type IntlCurrencySupport = typeof Intl & {
  supportedValuesOf: (key: 'currency') => string[]
}

let financialCurrencyCodes: ReadonlySet<string> | undefined

function supportedFinancialCurrencyCodes(): ReadonlySet<string> {
  if (financialCurrencyCodes) return financialCurrencyCodes
  const supportedValuesOf = (Intl as IntlCurrencySupport).supportedValuesOf
  if (typeof supportedValuesOf !== 'function') {
    throw new Error('ISO currency validation is not available in this runtime.')
  }
  financialCurrencyCodes = new Set(supportedValuesOf.call(Intl, 'currency'))
  return financialCurrencyCodes
}

function financialMoneyError(label: string, message: string): never {
  throw new Error(`${label} ${message}`)
}

export function requireFinancialCurrencyCode(
  value: unknown,
  label = 'Currency code'
): string {
  if (typeof value !== 'string' || !/^[A-Z]{3}$/.test(value)) {
    return financialMoneyError(label, 'must be an uppercase ISO currency code.')
  }
  if (!supportedFinancialCurrencyCodes().has(value)) {
    return financialMoneyError(label, 'must be a supported ISO currency code.')
  }
  return value
}

export function financialCurrencyMinorUnitDigits(value: unknown): number {
  const currencyCode = requireFinancialCurrencyCode(value)
  try {
    const digits = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
    }).resolvedOptions().maximumFractionDigits
    if (
      typeof digits !== 'number' ||
      !Number.isSafeInteger(digits) ||
      digits < 0 ||
      digits > 6
    ) {
      return financialMoneyError(
        'Currency code',
        'has unsupported minor-unit metadata.'
      )
    }
    return digits
  } catch {
    return financialMoneyError('Currency code', 'is not supported by Intl.')
  }
}

export function formatFinancialMinorAmount(
  amountMinor: unknown,
  currencyCode: unknown,
  options: FinancialMoneyFormatOptions = {}
): string {
  const money = requireFinancialMoney({
    amount_minor: amountMinor,
    currency_code: currencyCode,
  })
  const minorUnitDigits = financialCurrencyMinorUnitDigits(
    money.currency_code
  )

  return new Intl.NumberFormat(options.locales, {
    style: 'currency',
    currency: money.currency_code,
    currencyDisplay: options.currencyDisplay,
    currencySign: options.currencySign,
    useGrouping: options.useGrouping,
  }).format(money.amount_minor / 10 ** minorUnitDigits)
}

export function requireFinancialMinorAmount(
  value: unknown,
  options: FinancialMoneyValidationOptions = {}
): number {
  const label = options.label || 'Minor-unit amount'
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    return financialMoneyError(label, 'must be a safe integer.')
  }
  if (options.allowNegative === false && value < 0) {
    return financialMoneyError(label, 'must not be negative.')
  }
  if (options.allowZero === false && value === 0) {
    return financialMoneyError(label, 'must not be zero.')
  }
  return value
}

export function requireFinancialMoney(
  value: unknown,
  options: FinancialMoneyValidationOptions = {}
): FinancialMoney {
  const label = options.label || 'Money'
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return financialMoneyError(label, 'must be a money object.')
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record)
  if (
    keys.length !== 2 ||
    !keys.includes('amount_minor') ||
    !keys.includes('currency_code')
  ) {
    return financialMoneyError(
      label,
      'must contain only amount_minor and currency_code.'
    )
  }

  return {
    amount_minor: requireFinancialMinorAmount(record.amount_minor, {
      ...options,
      label: `${label} amount_minor`,
    }),
    currency_code: requireFinancialCurrencyCode(
      record.currency_code,
      `${label} currency_code`
    ),
  }
}

export function financialMoneyFromDecimal(input: {
  amount: number
  currencyCode: string
  minorUnitDigits: number
  allowNegative?: boolean
  allowZero?: boolean
  label?: string
}): FinancialMoney {
  const label = input.label || 'Money'
  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount)) {
    return financialMoneyError(label, 'decimal amount must be finite.')
  }
  if (
    !Number.isSafeInteger(input.minorUnitDigits) ||
    input.minorUnitDigits < 0 ||
    input.minorUnitDigits > 6
  ) {
    return financialMoneyError(label, 'minor-unit digits must be from 0 to 6.')
  }
  const currencyCode = requireFinancialCurrencyCode(
    input.currencyCode,
    `${label} currency_code`
  )
  const expectedMinorUnitDigits = financialCurrencyMinorUnitDigits(currencyCode)
  if (input.minorUnitDigits !== expectedMinorUnitDigits) {
    return financialMoneyError(
      label,
      'minor-unit digits must match the ISO currency exponent.'
    )
  }

  const factor = 10 ** input.minorUnitDigits
  const scaled = input.amount * factor
  const rounded = Math.round(scaled)
  const tolerance = Math.max(Number.EPSILON * Math.abs(scaled) * 4, 1e-7)
  if (Math.abs(scaled - rounded) > tolerance) {
    return financialMoneyError(
      label,
      `has more than ${input.minorUnitDigits} minor-unit digits.`
    )
  }

  return requireFinancialMoney(
    {
      amount_minor: rounded,
      currency_code: currencyCode,
    },
    {
      allowNegative: input.allowNegative,
      allowZero: input.allowZero,
      label,
    }
  )
}

export function addFinancialMoney(
  values: readonly FinancialMoney[],
  label = 'Money total'
): FinancialMoney {
  if (!values.length) return financialMoneyError(label, 'requires a value.')

  const first = requireFinancialMoney(values[0], { label: `${label} item 1` })
  let amountMinor = first.amount_minor

  for (let index = 1; index < values.length; index += 1) {
    const value = requireFinancialMoney(values[index], {
      label: `${label} item ${index + 1}`,
    })
    if (value.currency_code !== first.currency_code) {
      return financialMoneyError(label, 'cannot combine different currencies.')
    }
    amountMinor += value.amount_minor
    requireFinancialMinorAmount(amountMinor, { label })
  }

  return {
    amount_minor: amountMinor,
    currency_code: first.currency_code,
  }
}

export function multiplyFinancialMoney(
  value: FinancialMoney,
  multiplier: number,
  label = 'Money multiplication'
): FinancialMoney {
  const money = requireFinancialMoney(value, { label })
  if (!Number.isSafeInteger(multiplier) || multiplier < 0) {
    return financialMoneyError(label, 'multiplier must be a non-negative safe integer.')
  }

  return {
    amount_minor: requireFinancialMinorAmount(
      money.amount_minor * multiplier,
      { label }
    ),
    currency_code: money.currency_code,
  }
}
