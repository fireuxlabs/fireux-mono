import type {
  KitchenFinanceDailySummary,
  KitchenFinanceItemSummary,
} from '../../models/kitchen/finance-report.model'
import { formatFinancialMinorAmount } from 'fireux-finance/runtime/utils/money.ts'

export function useKitchenFinanceDayDetail(props: { currencyCode: string; day: KitchenFinanceDailySummary | null; locale: string; timezone: string }) {
  type ItemView = {
    key: string
    label: string
    variantLabel?: string
    quantityLabel: string
    saleCountLabel: string
    grossLabel: string
    sharePercent: number
    shareLabel: string
  }
  
  const currencySummary = computed(() =>
    props.day?.currencies.find(
      currency => currency.currency_code === props.currencyCode
    ) || null
  )
  
  const formattedDate = computed(() => {
    if (!props.day) return ''
    const parts = parseDateKey(props.day.date)
    if (!parts) return props.day.date
  
    return new Intl.DateTimeFormat(props.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)))
  })
  
  const formattedGrossSales = computed(() =>
    formatMoney(currencySummary.value?.gross_sales.amount_minor || 0)
  )
  
  const formattedItemSales = computed(() =>
    formatMoney(currencySummary.value?.item_sales.amount_minor || 0)
  )
  
  const formattedDeliveryFees = computed(() =>
    formatMoney(currencySummary.value?.delivery_fees.amount_minor || 0)
  )
  
  const headlineMetrics = computed(() => {
    const summary = currencySummary.value
    if (!summary) return []
  
    return [
      {
        label: 'Gross sales',
        value: formattedGrossSales.value,
        icon: 'i-lucide-banknote',
        description: 'Completed service total.',
      },
      {
        label: 'Completed sales',
        value: formatCount(summary.sale_count),
        icon: 'i-lucide-receipt-text',
        description: 'Completed, recorded sales.',
      },
      {
        label: 'Items sold',
        value: formatCount(summary.item_quantity),
        icon: 'i-lucide-utensils',
        description: 'Across completed sales.',
      },
      {
        label: 'Average sale',
        value: formatMoney(summary.average_sale.amount_minor),
        icon: 'i-lucide-chart-column',
        description: 'Gross sales per completed sale.',
      },
    ]
  })
  
  const sortedItems = computed<ItemView[]>(() => {
    const summary = currencySummary.value
    if (!summary) return []
  
    return [...summary.items]
      .sort((left, right) =>
        right.line_gross.amount_minor - left.line_gross.amount_minor
        || right.quantity - left.quantity
        || left.label.localeCompare(right.label, props.locale)
      )
      .map(item => toItemView(item, summary.item_sales.amount_minor))
  })
  
  function toItemView(
    item: KitchenFinanceItemSummary,
    itemSalesMinor: number
  ): ItemView {
    const sharePercent = itemSalesMinor > 0
      ? Math.min(
          100,
          Math.max(0, (item.line_gross.amount_minor / itemSalesMinor) * 100)
        )
      : 0
  
    return {
      key: [
        item.menu_id,
        item.source_item_id,
        item.dish_id,
        item.item_kind || '',
        item.variant_id || '',
      ].join(':'),
      label: item.label,
      ...(item.variant_label ? { variantLabel: item.variant_label } : {}),
      quantityLabel: formatCount(item.quantity),
      saleCountLabel: formatCount(item.sale_count),
      grossLabel: formatMoney(item.line_gross.amount_minor),
      sharePercent,
      shareLabel: `${sharePercent.toLocaleString(props.locale, {
        maximumFractionDigits: 1,
        minimumFractionDigits: sharePercent > 0 && sharePercent < 1 ? 1 : 0,
      })}%`,
    }
  }
  
  function formatMoney(amountMinor: number) {
    return formatFinancialMinorAmount(amountMinor, props.currencyCode, {
      locales: props.locale,
    })
  }
  
  function formatCount(value: number) {
    return value.toLocaleString(props.locale)
  }
  
  function parseDateKey(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) return null
  
    const parts = {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    }
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
    if (
      date.getUTCFullYear() !== parts.year
      || date.getUTCMonth() !== parts.month - 1
      || date.getUTCDate() !== parts.day
    ) {
      return null
    }
    return parts
  }

  return {
    currencySummary,
    formattedDate,
    formattedGrossSales,
    formattedItemSales,
    formattedDeliveryFees,
    headlineMetrics,
    sortedItems,
    toItemView,
    formatMoney,
    formatCount,
    parseDateKey,
  }
}
