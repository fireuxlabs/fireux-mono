import type { DocumentData, Timestamp } from 'firebase-admin/firestore'
import { requireFinancialMinorAmount } from 'fireux-finance/runtime/utils/money'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import type {
  KitchenFinanceItemSummary,
  KitchenFinanceTransactionSummary,
} from '../../../models/kitchen/finance-report.model.ts'

export const KITCHEN_GROSS_SALES_REPORT_MAX_DAYS = 93

export const KITCHEN_GROSS_SALES_REPORT_MAX_SALES = 5_000

export const KITCHEN_GROSS_SALES_REPORT_MAX_ITEM_GROUPS = 10_000

export const KITCHEN_GROSS_SALES_REPORT_MAX_LINES_PER_SALE = 250

export const KITCHEN_GROSS_SALES_REPORT_MAX_LINES = 25_000

export const MAX_PERIOD_MS =
  KITCHEN_GROSS_SALES_REPORT_MAX_DAYS * 24 * 60 * 60 * 1_000

export const RFC3339_PATTERN =
  /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.(\d{1,3}))?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/

export type ReportRow = {
  id: string
  data: () => DocumentData
}

export type ReportRange = {
  from: string
  to: string
  fromDate: Date
  toDate: Date
  fromTimestamp: Timestamp
  toTimestamp: Timestamp
}

export type ValidatedReportLine = Omit<
  KitchenFinanceItemSummary,
  'quantity' | 'sale_count' | 'line_gross'
> & {
  key: string
  quantity: number
  lineGrossMinor: number
}

export type ValidatedReportSale = {
  sourceId: string
  closedById: string
  orderNumber: string
  orderType: KitchenFinanceTransactionSummary['order_type']
  channel: KitchenFinanceTransactionSummary['channel']
  currencyCode: string
  occurredAt: Date
  grossSalesMinor: number
  itemSalesMinor: number
  deliveryFeesMinor: number
  lines: ValidatedReportLine[]
}

export type ItemAccumulator = Omit<
  KitchenFinanceItemSummary,
  'quantity' | 'sale_count' | 'line_gross'
> & {
  key: string
  quantity: number
  saleCount: number
  lineGrossMinor: number
}

export type CurrencyAccumulator = {
  currencyCode: string
  saleCount: number
  itemQuantity: number
  grossSalesMinor: number
  itemSalesMinor: number
  deliveryFeesMinor: number
  items: Map<string, ItemAccumulator>
}

export type DailyAccumulator = {
  saleCount: number
  currencies: Map<string, CurrencyAccumulator>
}

export type ItemGroupCounter = {
  value: number
}

export class KitchenGrossSalesReportInputError extends Error {}

export class KitchenGrossSalesReportInvariantError extends Error {}

export class KitchenGrossSalesReportLimitError extends Error {}

export function inputError(message: string): never {
  throw new KitchenGrossSalesReportInputError(message)
}

export function invariantError(message: string): never {
  throw new KitchenGrossSalesReportInvariantError(message)
}

export function limitError(message: string): never {
  throw new KitchenGrossSalesReportLimitError(message)
}

export function requireReportMinorAmount(value: unknown, label: string): number {
  try {
    return requireFinancialMinorAmount(value, {
      allowNegative: false,
      label,
    })
  } catch {
    return invariantError(`${label} is not a safe non-negative integer.`)
  }
}

export function requirePositiveSafeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    return invariantError(`${label} must be a positive safe integer.`)
  }
  return Number(value)
}

export function addCount(left: number, right: number, label: string): number {
  const value = left + right
  if (!Number.isSafeInteger(value) || value < 0) {
    return invariantError(`${label} exceeds the supported safe-integer range.`)
  }
  return value
}

export function requiredText(
  value: unknown,
  label: string,
  maxLength = 512
): string {
  if (
    typeof value !== 'string'
    || !value.trim()
    || value.length > maxLength
  ) {
    return invariantError(`${label} is missing or invalid.`)
  }
  return value
}

export function requiredId(value: unknown, label: string): string {
  const id = requiredText(value, label)
  if (id === '.' || id === '..' || id.includes('/')) {
    return invariantError(`${label} is not a valid document id.`)
  }
  return id
}

export function optionalText(
  value: unknown,
  label: string,
  maxLength = 512
): string | undefined {
  if (value == null || value === '') return undefined
  return requiredText(value, label, maxLength)
}

export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export function money(amountMinor: number, currencyCode: string): FinancialMoney {
  return {
    amount_minor: requireReportMinorAmount(
      amountMinor,
      'Kitchen Finance amount'
    ),
    currency_code: currencyCode,
  }
}

export function itemKey(
  item: Omit<
    KitchenFinanceItemSummary,
    'quantity' | 'sale_count' | 'line_gross'
  >
): string {
  return JSON.stringify([
    item.menu_id,
    item.source_item_id,
    item.dish_id,
    item.item_kind ?? null,
    item.variant_id ?? null,
    item.label,
    item.variant_label ?? null,
  ])
}
