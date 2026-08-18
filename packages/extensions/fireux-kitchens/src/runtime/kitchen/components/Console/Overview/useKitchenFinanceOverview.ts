import type {
  FinancialReportTrendView,
} from 'fireux-finance/runtime/models/report-presentation.model'
import { computed, ref, watch } from 'vue'
import { useKitchenConsoleFinance } from '../../../composables/console/overview/useKitchenConsoleFinance'
import type {
  KitchenFinanceDailySummary,
  KitchenFinanceTransactionSummary,
} from '../../../models/finance-report.model.ts'

export function useKitchenFinanceOverview(props: { fromDate: string; toDate: string }) {
  const {
    chooseRange,
    customFrom,
    customTo,
    report,
    pending,
    error,
  } = useKitchenConsoleFinance()
  
  watch(
    () => [props.fromDate, props.toDate] as const,
    ([fromDate, toDate]: readonly [string, string]) => {
      customFrom.value = fromDate
      customTo.value = toDate
      chooseRange('custom')
    },
    { immediate: true }
  )
  
  const isSingleDay = computed(() => props.fromDate === props.toDate)
  
  const periodLabel = computed(() =>
    isSingleDay.value
      ? formatDate(props.fromDate)
      : `${formatDate(props.fromDate)} – ${formatDate(props.toDate)}`
  )
  
  const currencySummary = computed(() => report.value?.currencies[0] ?? null)
  
  const transactions = computed<KitchenFinanceTransactionSummary[]>(
    () => report.value?.transactions ?? []
  )
  
  const grossSalesMinor = computed(() =>
    currencySummary.value?.gross_sales.amount_minor ?? 0
  )
  
  const completedChecks = computed(() => currencySummary.value?.sale_count ?? 0)
  
  const averageCheckMinor = computed(() =>
    currencySummary.value?.average_sale.amount_minor ?? 0
  )
  
  const itemsSold = computed(() => currencySummary.value?.item_quantity ?? 0)
  
  const salesTrend = computed<FinancialReportTrendView>(() => ({
    title: 'Gross sales',
    series: { primaryLabel: 'Completed checks' },
    points: isSingleDay.value
      ? hourlyTrendPoints()
      : dailyTrendPoints(),
  }))
  
  const serviceBreakdown = computed(() => {
    const services = new Map<string, { checks: number; amountMinor: number }>()
    for (const transaction of transactions.value) {
      const service = services.get(transaction.order_type) ?? {
        checks: 0,
        amountMinor: 0,
      }
      service.checks += 1
      service.amountMinor += transaction.gross_sale.amount_minor
      services.set(transaction.order_type, service)
    }
    return [...services.entries()]
      .map(([type, values]) => ({ type, ...values }))
      .sort((left, right) => right.amountMinor - left.amountMinor)
  })
  
  const bestSellers = computed(() =>
    [...(currencySummary.value?.items ?? [])]
      .sort((left, right) => right.line_gross.amount_minor - left.line_gross.amount_minor)
      .slice(0, 5)
  )
  
  type ServiceFilter = 'all' | KitchenFinanceTransactionSummary['order_type']
  
  const serviceOptions: {
    value: ServiceFilter
    label: string
  }[] = [
    { value: 'all', label: 'All' },
    { value: 'eat_in', label: 'Eat in' },
    { value: 'takeaway', label: 'Takeaway' },
    { value: 'collection', label: 'Collection' },
  ]
  
  const selectedService = ref<ServiceFilter>('all')
  
  const filteredTransactions = computed(() =>
    selectedService.value === 'all'
      ? transactions.value
      : transactions.value.filter(
          (transaction: KitchenFinanceTransactionSummary) =>
            transaction.order_type === selectedService.value
        )
  )
  
  const filteredTotalMinor = computed(() =>
    filteredTransactions.value.reduce(
      (total: number, transaction: KitchenFinanceTransactionSummary) =>
        total + transaction.signed_amount.amount_minor,
      0
    )
  )
  
  const transactionOpen = ref(false)
  
  const selectedTransaction = ref<KitchenFinanceTransactionSummary | null>(null)
  
  const selectedTransactionDetails = computed(() => {
    const transaction = selectedTransaction.value
    if (!transaction) return []
    return [
      { label: 'Time', value: formatTransactionDateTime(transaction.occurred_at) },
      ...(transaction.placed_at
        ? [{
            label: 'Placed',
            value: formatTransactionDateTime(transaction.placed_at),
          }]
        : []),
      { label: 'Order', value: `#${transaction.order_number}` },
      { label: 'Status', value: formatTransactionType(transaction.status) },
      { label: 'Type', value: formatTransactionType(transaction.order_type) },
      { label: 'Channel', value: formatTransactionType(transaction.channel) },
      { label: 'Closed by', value: transaction.closed_by },
      { label: 'Counterparty', value: transaction.counterparty },
      { label: 'Summary', value: transaction.summary },
      {
        label: 'Source',
        value: `${
          transaction.source.kind === 'completed_order'
            ? 'Completed Order'
            : 'Kitchen Sale'
        } · ${transaction.source.id}`,
      },
      ...(transaction.source.service_id
        ? [{
            label: 'Service',
            value: transaction.source.service_number
              ? `#${transaction.source.service_number} · ${transaction.source.service_id}`
              : transaction.source.service_id,
          }]
        : []),
      {
        label: 'Items',
        value: formatCount(transaction.item_quantity),
      },
    ]
  })
  
  const currencyCode = computed(() =>
    currencySummary.value?.currency_code ?? 'CHF'
  )
  
  function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(
      new Date(`${value}T12:00:00`)
    )
  }
  
  function formatMoney(amountMinor: number) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode.value,
    }).format(amountMinor / 100)
  }
  
  function formatSignedMoney(amountMinor: number) {
    const sign = amountMinor > 0 ? '+' : amountMinor < 0 ? '−' : ''
    return `${sign}${formatMoney(Math.abs(amountMinor))}`
  }
  
  function formatCount(value: number) {
    return new Intl.NumberFormat('en-GB').format(value)
  }
  
  function hourlyTrendPoints(): FinancialReportTrendView['points'] {
    if (!transactions.value.length) return []
    const hourFormatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hour12: false,
      timeZone: report.value?.timezone ?? 'UTC',
    })
    const buckets = new Map<number, {
      amountMinor: number
      checks: number
      label: string
    }>()
    for (const transaction of transactions.value) {
      const hour = Number(hourFormatter.format(new Date(transaction.occurred_at)))
      const bucket = buckets.get(hour) ?? {
        amountMinor: 0,
        checks: 0,
        label: `${String(hour).padStart(2, '0')}:00`,
      }
      bucket.amountMinor += transaction.signed_amount.amount_minor
      bucket.checks += 1
      buckets.set(hour, bucket)
    }
    const hours = [...buckets.keys()]
    const firstHour = Math.min(...hours)
    const lastHour = Math.max(...hours)
    return Array.from({ length: lastHour - firstHour + 1 }, (_, index) => {
      const hour = firstHour + index
      const bucket = buckets.get(hour) ?? {
        amountMinor: 0,
        checks: 0,
        label: `${String(hour).padStart(2, '0')}:00`,
      }
      return {
        id: `${props.fromDate}-${hour}`,
        label: bucket.label,
        value: bucket.amountMinor,
        valueLabel: formatMoney(bucket.amountMinor),
        secondaryLabel: `${formatCount(bucket.checks)} completed checks`,
      }
    })
  }
  
  function dailyTrendPoints(): FinancialReportTrendView['points'] {
    return (report.value?.daily ?? []).map((day: KitchenFinanceDailySummary) => {
      const summary = day.currencies[0]
      const amountMinor = summary?.gross_sales.amount_minor ?? 0
      return {
        id: day.date,
        label: new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'short',
          timeZone: 'UTC',
        }).format(new Date(`${day.date}T00:00:00.000Z`)),
        value: amountMinor,
        valueLabel: formatMoney(amountMinor),
        secondaryLabel: `${formatCount(day.sale_count)} completed checks`,
      }
    })
  }
  
  function formatTransactionTime(value: string) {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }
  
  function formatTransactionDateTime(value: string) {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  }
  
  function formatTransactionType(value: string) {
    return value
      .split('_')
      .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ')
  }
  
  function inspectTransaction(transaction: KitchenFinanceTransactionSummary) {
    selectedTransaction.value = transaction
    transactionOpen.value = true
  }

  return {
    chooseRange,
    customFrom,
    customTo,
    report,
    pending,
    error,
    isSingleDay,
    periodLabel,
    currencySummary,
    transactions,
    grossSalesMinor,
    completedChecks,
    averageCheckMinor,
    itemsSold,
    salesTrend,
    serviceBreakdown,
    bestSellers,
    serviceOptions,
    selectedService,
    filteredTransactions,
    filteredTotalMinor,
    transactionOpen,
    selectedTransaction,
    selectedTransactionDetails,
    currencyCode,
    formatDate,
    formatMoney,
    formatSignedMoney,
    formatCount,
    hourlyTrendPoints,
    dailyTrendPoints,
    formatTransactionTime,
    formatTransactionDateTime,
    formatTransactionType,
    inspectTransaction,
  }
}
