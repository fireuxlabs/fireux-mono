<template>
  <section class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <UCard>
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-medium text-muted">Gross sales</p>
          <UIcon name="i-lucide-banknote" class="size-4 text-dimmed" />
        </div>
        <p class="mt-2 text-xl font-semibold tabular-nums text-highlighted">
          {{ formatMoney(grossSalesMinor) }}
        </p>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-medium text-muted">Completed checks</p>
          <UIcon name="i-lucide-receipt-text" class="size-4 text-dimmed" />
        </div>
        <p class="mt-2 text-xl font-semibold tabular-nums text-highlighted">
          {{ formatCount(completedChecks) }}
        </p>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-medium text-muted">Average check</p>
          <UIcon name="i-lucide-calculator" class="size-4 text-dimmed" />
        </div>
        <p class="mt-2 text-xl font-semibold tabular-nums text-highlighted">
          {{ formatMoney(averageCheckMinor) }}
        </p>
      </UCard>
      <UCard>
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-medium text-muted">Items sold</p>
          <UIcon name="i-lucide-utensils" class="size-4 text-dimmed" />
        </div>
        <p class="mt-2 text-xl font-semibold tabular-nums text-highlighted">
          {{ formatCount(itemsSold) }}
        </p>
      </UCard>
    </div>

    <UCard
      v-if="currencySummary && salesTrend.points.length > 1"
    >
      <FinanceReportTrend :trend="salesTrend" size="lg" />
    </UCard>

    <div
      v-if="currencySummary"
      class="grid gap-4 lg:grid-cols-2"
    >
      <UCard>
        <template #header>
          <h2 class="text-sm font-semibold text-highlighted">
            Sales by service
          </h2>
        </template>
        <ul class="divide-y divide-default">
          <li
            v-for="service in serviceBreakdown"
            :key="service.type"
            class="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-highlighted">
                {{ formatTransactionType(service.type) }}
              </p>
              <p class="mt-0.5 text-xs text-muted">
                {{ formatCount(service.checks) }} checks
              </p>
            </div>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-highlighted">
              {{ formatMoney(service.amountMinor) }}
            </p>
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-sm font-semibold text-highlighted">
            Best sellers
          </h2>
        </template>
        <ul class="divide-y divide-default">
          <li
            v-for="item in bestSellers"
            :key="`${item.source_item_id}:${item.variant_id ?? ''}`"
            class="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.label }}
              </p>
              <p class="mt-0.5 text-xs text-muted">
                {{ formatCount(item.quantity) }} sold
              </p>
            </div>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-highlighted">
              {{ formatMoney(item.line_gross.amount_minor) }}
            </p>
          </li>
        </ul>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-sm font-semibold text-highlighted">
            {{ isSingleDay ? 'Today’s completed checks' : 'Completed checks' }}
          </h2>
          <p class="mt-1 text-xs text-muted">
            {{ periodLabel }}
          </p>
        </div>

        <UFieldGroup size="sm" aria-label="Service type">
          <UButton
            v-for="option in serviceOptions"
            :key="option.value"
            :label="option.label"
            color="neutral"
            :variant="selectedService === option.value ? 'solid' : 'ghost'"
            :aria-pressed="selectedService === option.value"
            @click="selectedService = option.value"
          />
        </UFieldGroup>
        </div>
      </template>

      <div v-if="pending" class="p-4">
        <USkeleton class="h-48 w-full" />
      </div>

      <div v-else-if="error" class="p-4">
        <UAlert
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="Could not load the sales report"
          :description="error"
        />
      </div>

      <div
        v-else-if="currencySummary && filteredTransactions.length === 0"
        class="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center"
      >
        <UIcon
          name="i-lucide-receipt-text"
          class="size-6 text-dimmed"
          aria-hidden="true"
        />
        <p class="mt-3 text-sm font-medium text-highlighted">
          No completed checks for this service
        </p>
      </div>

      <div
        v-else-if="!currencySummary"
        class="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center"
      >
        <UIcon
          name="i-lucide-receipt-text"
          class="size-6 text-dimmed"
          aria-hidden="true"
        />
        <p class="mt-3 text-sm font-medium text-highlighted">
          No completed sales
        </p>
        <p class="mt-1 text-xs text-muted">
          There is no money-in data for this period.
        </p>
      </div>

      <div v-else>
        <ul
          class="divide-y divide-default"
          :aria-label="`Completed checks for ${periodLabel}`"
        >
          <li
            v-for="transaction in filteredTransactions"
            :key="transaction.source.id"
            class="flex items-center gap-3 px-4 py-3.5"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
            >
              <UIcon
                name="i-lucide-arrow-down-left"
                class="size-4"
                aria-hidden="true"
              />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex min-w-0 items-center gap-2">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ transaction.summary }}
                </p>
                <UBadge color="success" variant="subtle" size="sm">
                  Completed
                </UBadge>
              </div>
              <p class="mt-0.5 truncate text-xs text-muted">
                {{ formatTransactionTime(transaction.occurred_at) }}
                · {{ formatTransactionType(transaction.order_type) }}
                · {{ transaction.closed_by }}
                · {{ formatCount(transaction.item_quantity) }} items
              </p>
            </div>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-success">
              {{ formatSignedMoney(transaction.signed_amount.amount_minor) }}
            </p>
            <UButton
              icon="i-lucide-search"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="`Inspect order ${transaction.order_number}`"
              @click="inspectTransaction(transaction)"
            />
          </li>
        </ul>
      </div>

      <template
        v-if="currencySummary && filteredTransactions.length"
        #footer
      >
        <div class="flex items-center justify-between gap-4 text-sm font-semibold">
          <span class="text-highlighted">
            {{ formatCount(filteredTransactions.length) }} completed checks
          </span>
          <span class="tabular-nums text-success">
            {{ formatSignedMoney(filteredTotalMinor) }}
          </span>
        </div>
      </template>
    </UCard>

    <UModal
      v-model:open="transactionOpen"
      :title="selectedTransaction
        ? `Order #${selectedTransaction.order_number}`
        : 'Transaction details'"
      description="Completed sale"
      :ui="{ content: 'sm:max-w-md' }"
      @after:leave="selectedTransaction = null"
    >
      <template #body>
        <div v-if="selectedTransaction" class="space-y-5">
          <div
            class="flex items-center justify-between gap-4 rounded-xl bg-elevated/50 p-4"
          >
            <div>
              <p class="text-xs font-medium text-muted">
                Money in
              </p>
              <p class="mt-1 text-2xl font-semibold tabular-nums text-success">
                {{ formatSignedMoney(selectedTransaction.signed_amount.amount_minor) }}
              </p>
            </div>
            <span
              class="flex size-10 items-center justify-center rounded-full bg-success/10 text-success"
            >
              <UIcon
                name="i-lucide-arrow-down-left"
                class="size-5"
                aria-hidden="true"
              />
            </span>
          </div>

          <dl class="divide-y divide-default rounded-xl border border-default">
            <div
              v-for="detail in selectedTransactionDetails"
              :key="detail.label"
              class="flex items-center justify-between gap-4 px-4 py-3"
            >
              <dt class="text-sm text-muted">
                {{ detail.label }}
              </dt>
              <dd class="text-right text-sm font-medium text-highlighted">
                {{ detail.value }}
              </dd>
            </div>
          </dl>

          <section aria-labelledby="transaction-items-title">
            <div class="flex items-center justify-between gap-3">
              <h3
                id="transaction-items-title"
                class="text-sm font-semibold text-highlighted"
              >
                Items
              </h3>
              <span class="text-xs text-muted">
                {{ formatCount(selectedTransaction.item_quantity) }}
              </span>
            </div>
            <ul
              class="mt-2 divide-y divide-default rounded-xl border border-default"
            >
              <li
                v-for="(item, index) in selectedTransaction.items"
                :key="`${item.label}:${index}`"
                class="flex min-w-0 items-center gap-2 px-4 py-3"
              >
                <span class="shrink-0 whitespace-nowrap text-sm tabular-nums text-muted">
                  {{ item.quantity }}×
                </span>
                <span class="min-w-0 flex-1 truncate text-sm text-highlighted">
                  {{ item.label }}
                </span>
                <span class="shrink-0 whitespace-nowrap text-sm tabular-nums text-muted">
                  {{ formatMoney(item.line_gross.amount_minor) }}
                </span>
              </li>
            </ul>
          </section>

        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end">
          <UButton
            color="neutral"
            variant="ghost"
            @click="transactionOpen = false"
          >
            Close
          </UButton>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FinanceReportTrend from 'fireux-finance/runtime/components/Finance/ReportTrend.vue'
import type {
  FinancialReportTrendView,
} from 'fireux-finance/runtime/models/report-presentation.model.ts'
import { useKitchenConsoleFinance } from '../../../../composables/fireux/console/kitchen/overview/useKitchenConsoleFinance'
import type { KitchenFinanceTransactionSummary } from '../../../../models/kitchen/finance-report.model'

const props = defineProps<{
  fromDate: string
  toDate: string
}>()

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
const transactions = computed(() => report.value?.transactions ?? [])
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
        transaction => transaction.order_type === selectedService.value
      )
)
const filteredTotalMinor = computed(() =>
  filteredTransactions.value.reduce(
    (total, transaction) => total + transaction.signed_amount.amount_minor,
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
  return (report.value?.daily ?? []).map(day => {
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
</script>
