import {
  financialCurrencyMinorUnitDigits,
  requireFinancialMinorAmount,
} from 'fireux-finance/runtime/utils/money.ts'
import type { KitchenDemoFinanceSource } from './demo-finance.types'
import { addIsoDays, ISO_DATE_PATTERN, validTimezone } from './demo-finance-date'
import { itemKey, MAX_DAILY_ITEM_GROUPS } from './demo-finance-items'

const isArrayValue = (value: unknown): boolean => Array.isArray(value)

export function requireKitchenDemoFinanceDays(
  finance: KitchenDemoFinanceSource,
  minimumDays: number
) {
  if (
    !ISO_DATE_PATTERN.test(finance.asOfDate)
    || !/^[A-Z]{3}$/.test(finance.currencyCode)
    || !validTimezone(finance.timezone)
    || !isArrayValue(finance.dailyGrossSales)
    || finance.dailyGrossSales.length < minimumDays
    || finance.dailyGrossSales.length > 366
  ) {
    throw new Error('Kitchen Demo Finance source is incomplete.')
  }
  financialCurrencyMinorUnitDigits(finance.currencyCode)

  const seenDates = new Set<string>()
  const seenOrderIds = new Set<string>()
  const daily = finance.dailyGrossSales.map((day, index) => {
    if (
      !ISO_DATE_PATTERN.test(day.date)
      || seenDates.has(day.date)
      || !Number.isSafeInteger(day.saleCount)
      || day.saleCount <= 0
    ) {
      throw new Error(`Kitchen Demo Finance day ${index + 1} is invalid.`)
    }
    requireFinancialMinorAmount(day.grossSalesMinor, {
      allowNegative: false,
      allowZero: false,
      label: `Kitchen Demo gross sales for ${day.date}`,
    })
    requireFinancialMinorAmount(day.itemSalesMinor, {
      allowNegative: false,
      allowZero: false,
      label: `Kitchen Demo item sales for ${day.date}`,
    })
    requireFinancialMinorAmount(day.deliveryFeesMinor, {
      allowNegative: false,
      label: `Kitchen Demo delivery fees for ${day.date}`,
    })
    if (
      !Number.isSafeInteger(day.itemQuantity)
      || day.itemQuantity <= 0
      || !isArrayValue(day.items)
      || day.items.length === 0
      || day.items.length > MAX_DAILY_ITEM_GROUPS
      || !isArrayValue(day.transactions)
      || day.transactions.length !== day.saleCount
    ) {
      throw new Error(`Kitchen Demo Finance items for ${day.date} are invalid.`)
    }

    const itemKeys = new Set<string>()
    const itemSummary = day.items.reduce(
      (summary, item, itemIndex) => {
        const key = itemKey(item)
        if (
          !key
          || itemKeys.has(key)
          || !Number.isSafeInteger(item.quantity)
          || item.quantity <= 0
          || !Number.isSafeInteger(item.saleCount)
          || item.saleCount <= 0
          || item.saleCount > item.quantity
          || item.saleCount > day.saleCount
        ) {
          throw new Error(
            `Kitchen Demo Finance item ${itemIndex + 1} for ${day.date} is invalid.`
          )
        }
        requireFinancialMinorAmount(item.lineGrossMinor, {
          allowNegative: false,
          allowZero: false,
          label: `Kitchen Demo item sales for ${item.label}`,
        })
        itemKeys.add(key)
        return {
          quantity: summary.quantity + item.quantity,
          lineGrossMinor: requireFinancialMinorAmount(
            summary.lineGrossMinor + item.lineGrossMinor,
            {
              allowNegative: false,
              label: `Kitchen Demo item-sales total for ${day.date}`,
            }
          ),
        }
      },
      { quantity: 0, lineGrossMinor: 0 }
    )
    if (
      itemSummary.quantity !== day.itemQuantity
      || itemSummary.quantity < day.saleCount
      || itemSummary.lineGrossMinor !== day.itemSalesMinor
      || day.itemSalesMinor + day.deliveryFeesMinor !== day.grossSalesMinor
    ) {
      throw new Error(
        `Kitchen Demo Finance totals for ${day.date} do not reconcile.`
      )
    }
    const transactionSummary = day.transactions.reduce(
      (summary, transaction, transactionIndex) => {
        if (
          !transaction.orderNumber
          || !transaction.orderId
          || seenOrderIds.has(transaction.orderId)
          || !transaction.serviceId
          || transaction.source.kind !== 'completed_order'
          || transaction.source.id !== transaction.orderId
          || transaction.source.serviceId !== transaction.serviceId
          || transaction.source.serviceNumber !== transaction.serviceNumber
          || !Number.isSafeInteger(transaction.serviceNumber)
          || transaction.serviceNumber <= 0
          || !Number.isFinite(Date.parse(transaction.placedAt))
          || !Number.isFinite(Date.parse(transaction.occurredAt))
          || Date.parse(transaction.placedAt) >= Date.parse(transaction.occurredAt)
          || !transaction.occurredAt.startsWith(day.date)
          || !['eat_in', 'takeaway', 'collection'].includes(transaction.orderType)
          || !['kiosk', 'menu'].includes(transaction.channel)
          || transaction.status !== 'completed'
          || !transaction.closedByTeamMemberId
          || !transaction.closedBy
          || !transaction.counterparty
          || !transaction.summary
          || !Number.isSafeInteger(transaction.itemQuantity)
          || transaction.itemQuantity <= 0
          || !isArrayValue(transaction.items)
          || transaction.items.length === 0
        ) {
          throw new Error(
            `Kitchen Demo Finance transaction ${transactionIndex + 1} for ${day.date} is invalid.`
          )
        }
        requireFinancialMinorAmount(transaction.grossSalesMinor, {
          allowNegative: false,
          allowZero: false,
          label: `Kitchen Demo transaction gross sales for ${day.date}`,
        })
        requireFinancialMinorAmount(transaction.signedAmountMinor, {
          allowNegative: false,
          allowZero: false,
          label: `Kitchen Demo signed transaction amount for ${day.date}`,
        })
        if (transaction.signedAmountMinor !== transaction.grossSalesMinor) {
          throw new Error(
            `Kitchen Demo Finance signed amount for ${transaction.orderId} does not reconcile.`
          )
        }
        seenOrderIds.add(transaction.orderId)
        const transactionItems = transaction.items.reduce(
          (itemSummary, item) => {
            if (
              !item.label
              || !Number.isSafeInteger(item.unitPriceMinor)
              || item.unitPriceMinor <= 0
              || !Number.isSafeInteger(item.quantity)
              || item.quantity <= 0
              || item.unitPriceMinor * item.quantity !== item.lineGrossMinor
            ) {
              throw new Error(
                `Kitchen Demo Finance transaction items for ${day.date} are invalid.`
              )
            }
            requireFinancialMinorAmount(item.lineGrossMinor, {
              allowNegative: false,
              allowZero: false,
              label: `Kitchen Demo transaction item gross for ${day.date}`,
            })
            return {
              quantity: itemSummary.quantity + item.quantity,
              grossSalesMinor:
                itemSummary.grossSalesMinor + item.lineGrossMinor,
            }
          },
          { quantity: 0, grossSalesMinor: 0 }
        )
        if (
          transactionItems.quantity !== transaction.itemQuantity
          || transactionItems.grossSalesMinor !== transaction.grossSalesMinor
        ) {
          throw new Error(
            `Kitchen Demo Finance transaction items for ${day.date} do not reconcile.`
          )
        }
        return {
          itemQuantity: summary.itemQuantity + transaction.itemQuantity,
          grossSalesMinor: summary.grossSalesMinor + transaction.grossSalesMinor,
        }
      },
      { itemQuantity: 0, grossSalesMinor: 0 }
    )
    if (
      transactionSummary.itemQuantity !== day.itemQuantity
      || transactionSummary.grossSalesMinor !== day.grossSalesMinor
    ) {
      throw new Error(
        `Kitchen Demo Finance transactions for ${day.date} do not reconcile.`
      )
    }
    seenDates.add(day.date)

    if (
      index > 0
      && day.date !== addIsoDays(finance.dailyGrossSales[index - 1].date, 1)
    ) {
      throw new Error('Kitchen Demo Finance days must be contiguous.')
    }
    return {
      ...day,
      items: day.items.map(item => ({ ...item })),
      transactions: day.transactions.map(transaction => ({
        ...transaction,
        items: transaction.items.map(item => ({ ...item })),
      })),
    }
  })

  if (daily[daily.length - 1].date !== finance.asOfDate) {
    throw new Error('Kitchen Demo Finance must end on its as-of date.')
  }
  return daily
}
