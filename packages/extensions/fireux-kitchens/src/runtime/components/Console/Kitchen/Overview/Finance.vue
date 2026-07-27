<!-- Concurrent edit — 2026-07-27 — Kitchen Finance: add reconciled period, calendar, item and roundup presentation. -->
<template>
  <section class="console-surface kitchen-finance-report">
    <UPageHeader
      :headline="kitchenName"
      title="Every service, in one clear view."
      description="See what the Kitchen sold, spot the days that moved the period and open any date for its item mix."
    />

    <UPageCard class="kitchen-finance-report__controls" variant="subtle">
      <div class="kitchen-finance-report__control">
        <p>Reporting period</p>
        <span>Completed service only</span>
        <UFieldGroup size="sm" aria-label="Finance report period">
          <UButton
            v-for="option in periodOptions"
            :key="option.value"
            :label="option.label"
            :color="selectedPeriod === option.value ? 'primary' : 'neutral'"
            :variant="selectedPeriod === option.value ? 'solid' : 'ghost'"
            :aria-pressed="selectedPeriod === option.value"
            @click="selectedPeriod = option.value"
          />
        </UFieldGroup>
      </div>

      <div
        v-if="currencyOptions.length > 1"
        class="kitchen-finance-report__control"
      >
        <p>Currency</p>
        <span>Totals stay separate</span>
        <UFieldGroup size="sm" aria-label="Finance report currency">
          <UButton
            v-for="currency in currencyOptions"
            :key="currency"
            :label="currency"
            :color="activeCurrencyCode === currency ? 'primary' : 'neutral'"
            :variant="activeCurrencyCode === currency ? 'solid' : 'ghost'"
            :aria-pressed="activeCurrencyCode === currency"
            @click="activeCurrencyCode = currency"
          />
        </UFieldGroup>
      </div>

      <div class="kitchen-finance-report__status">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              v-if="report"
              color="neutral"
              variant="outline"
              icon="i-lucide-clock-3"
            >
              {{ report.timezone }}
            </UBadge>
          </div>
          <p v-if="report" class="kitchen-finance-report__period">
            {{ formattedReportPeriod }}
          </p>
        </div>

        <UButton
          label="Refresh"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="soft"
          :loading="pending"
          :disabled="!canLoad"
          @click="refresh"
        />
      </div>
    </UPageCard>

    <div
      v-if="pending"
      class="kitchen-finance-report__loading"
      aria-label="Loading Finance report"
    >
      <USkeleton class="h-72" />
      <div class="kitchen-finance-report__overview">
        <USkeleton class="h-96" />
        <USkeleton class="h-96" />
      </div>
      <div class="kitchen-finance-report__daily">
        <USkeleton class="h-96" />
        <USkeleton class="h-96" />
      </div>
    </div>

    <MoleculesStateCard
      v-else-if="error"
      entity="Finance report"
      state="error"
      title="Finance report unavailable"
      :description="error"
      icon="i-lucide-circle-alert"
    >
      <UButton
        v-if="canLoad"
        class="mt-2"
        label="Try again"
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="soft"
        @click="refresh"
      />
    </MoleculesStateCard>

    <MoleculesStateCard
      v-else-if="!report && !canLoad"
      entity="Finance report"
      state="empty"
      title="Finance is not available for this Kitchen"
      description="Choose a Kitchen with completed sales to view its Finance report."
      icon="i-lucide-receipt-text"
    />

    <MoleculesStateCard
      v-else-if="report && report.sale_count === 0"
      entity="completed sales"
      state="empty"
      title="No completed sales in this period"
      description="New sales appear here when priced Orders reach Completed. Earlier Orders are not guessed or backfilled."
      icon="i-lucide-receipt-text"
    />

    <div
      v-else-if="report && activeCurrencySummary"
      class="kitchen-finance-report__content"
      aria-live="polite"
    >
      <KitchenFinanceSummary
        :average-daily-gross-sales-minor="averageDailyGrossSalesMinor"
        :average-sale-minor="activeCurrencySummary.average_sale.amount_minor"
        :comparison="periodComparison"
        :currency-code="activeCurrencyCode"
        :gross-sales-minor="activeCurrencySummary.gross_sales.amount_minor"
        :item-quantity="activeCurrencySummary.item_quantity"
        :period-label="formattedReportPeriod"
        :sale-count="activeCurrencySummary.sale_count"
      />

      <div class="kitchen-finance-report__overview">
        <KitchenFinanceTrend
          :average-daily-gross-sales-minor="averageDailyGrossSalesMinor"
          :best-day="bestDay"
          :comparison-percent="
            demoFinanceReport?.comparison.grossSalesChangePercent ?? null
          "
          :currency-code="activeCurrencyCode"
          :interval-days="trendIntervalDays"
          :period-label="selectedPeriodLabel"
          :points="currentTrend"
          :previous-points="previousTrend"
          :show-insights="false"
          size="lg"
        />

        <KitchenFinanceRoundup
          :best-day="bestDay"
          :currency-code="activeCurrencyCode"
          :period-label="selectedPeriodLabel"
          :quietest-day="quietestDay"
          :strongest-weekday="strongestWeekday"
          :timezone="report.timezone"
          :top-item="topItem"
        />
      </div>

      <div class="kitchen-finance-report__daily">
        <KitchenFinanceCalendar
          v-model:selected-date="selectedDate"
          :currency-code="activeCurrencyCode"
          :days="calendarDays"
          :timezone="report.timezone"
        />

        <KitchenFinanceDayDetail
          :currency-code="activeCurrencyCode"
          :day="selectedDay"
          :timezone="report.timezone"
        />
      </div>

      <div class="kitchen-finance-report__assurance">
        <div
          v-for="item in reportAssurances"
          :key="item.label"
          class="kitchen-finance-report__assurance-item"
        >
          <UIcon :name="item.icon" aria-hidden="true" />
          <span>
            <strong>{{ item.label }}</strong>
            {{ item.value }}
          </span>
        </div>
      </div>

      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Gross sales report"
        description="This view includes completed Kitchen sales and their recorded item totals. Costs, VAT, payments, labour and profit remain out until their producing operations exist."
      />
    </div>

    <MoleculesStateCard
      v-else
      entity="Finance report"
      state="empty"
      title="Choose a Kitchen with completed sales"
      description="Finance appears when the selected Kitchen has completed sales."
      icon="i-lucide-chart-no-axes-combined"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  KitchenFinanceReportPeriodDays,
  type KitchenFinanceCurrencySummary,
  type KitchenFinanceDailySummary,
  type KitchenFinanceItemSummary,
} from '../../../../models/kitchen/finance-report.model'
import { useKitchenConsoleFinance } from '../../../../composables/fireux/console/kitchen/overview/useKitchenConsoleFinance'

type FinanceTrendPoint = {
  id: string
  fromDate: string
  toDate: string
  saleCount: number
  grossSalesMinor: number
}

type DayHighlight = {
  date: string
  saleCount: number
  grossSalesMinor: number
}

const locale = 'en-GB'
const {
  selectedPeriod,
  periodOptions,
  report,
  demoFinanceReport,
  pending,
  error,
  kitchenName,
  canLoad,
  refresh,
} = useKitchenConsoleFinance()

const activeCurrencyCode = ref('')
const selectedDate = ref('')

const selectedPeriodLabel = computed(() =>
  periodOptions.find(option => option.value === selectedPeriod.value)?.label
  ?? selectedPeriod.value
)
const currencyOptions = computed(() =>
  report.value?.currencies.map(summary => summary.currency_code) ?? []
)
const activeCurrencySummary = computed(() =>
  report.value?.currencies.find(
    summary => summary.currency_code === activeCurrencyCode.value
  ) ?? null
)
const periodComparison = computed(() => {
  const comparison = demoFinanceReport.value?.comparison
  if (!comparison) return null
  return {
    grossSalesPercent: comparison.grossSalesChangePercent,
    saleCountPercent: comparison.saleCountChangePercent,
    averageSalePercent: comparison.averageSaleChangePercent,
  }
})
const averageDailyGrossSalesMinor = computed(() => {
  if (demoFinanceReport.value) {
    return demoFinanceReport.value.averageDailyGrossSalesMinor
  }
  const summary = activeCurrencySummary.value
  if (!summary) return null
  return Math.round(
    summary.gross_sales.amount_minor
    / KitchenFinanceReportPeriodDays[selectedPeriod.value]
  )
})
const calendarDays = computed<KitchenFinanceDailySummary[]>(() => {
  const value = report.value
  const currencyCode = activeCurrencyCode.value
  if (!value || !currencyCode) return []

  const observed = new Map(
    value.daily.map(day => [day.date, day] as const)
  )
  const bounds = localPeriodBounds()
  if (!bounds) {
    return [...value.daily].sort((left, right) =>
      left.date.localeCompare(right.date)
    )
  }

  const days: KitchenFinanceDailySummary[] = []
  let date = bounds.from
  for (let index = 0; index < 96 && date <= bounds.to; index += 1) {
    const day = observed.get(date)
    days.push(
      day
        ? withCurrencyBucket(day, currencyCode)
        : emptyFinanceDay(date, currencyCode)
    )
    date = addIsoDays(date, 1)
  }
  return days
})
const selectedDay = computed<KitchenFinanceDailySummary | null>(() =>
  calendarDays.value.find(day => day.date === selectedDate.value) ?? null
)
const dayHighlights = computed<DayHighlight[]>(() =>
  calendarDays.value.map(day => {
    const summary = currencySummary(day, activeCurrencyCode.value)
    return {
      date: day.date,
      saleCount: summary?.sale_count ?? 0,
      grossSalesMinor: summary?.gross_sales.amount_minor ?? 0,
    }
  })
)
const bestDay = computed<DayHighlight | null>(() =>
  dayHighlights.value.reduce<DayHighlight | null>(
    (best, day) =>
      !best || day.grossSalesMinor > best.grossSalesMinor ? day : best,
    null
  )
)
const quietestDay = computed<DayHighlight | null>(() =>
  dayHighlights.value.reduce<DayHighlight | null>(
    (quietest, day) =>
      !quietest || day.grossSalesMinor < quietest.grossSalesMinor
        ? day
        : quietest,
    null
  )
)
const topItem = computed<KitchenFinanceItemSummary | null>(() =>
  activeCurrencySummary.value?.items.reduce<KitchenFinanceItemSummary | null>(
    (top, item) =>
      !top || item.line_gross.amount_minor > top.line_gross.amount_minor
        ? item
        : top,
    null
  ) ?? null
)
const strongestWeekday = computed(() => {
  const weekdays = new Map<number, {
    dayCount: number
    grossSalesMinor: number
  }>()
  calendarDays.value.forEach(day => {
    const weekday = isoDateWeekday(day.date)
    const current = weekdays.get(weekday) ?? {
      dayCount: 0,
      grossSalesMinor: 0,
    }
    current.dayCount += 1
    current.grossSalesMinor +=
      currencySummary(day, activeCurrencyCode.value)
        ?.gross_sales.amount_minor ?? 0
    weekdays.set(weekday, current)
  })
  const strongest = [...weekdays.entries()].reduce<{
    weekday: number
    average: number
  } | null>((best, [weekday, summary]) => {
    const average = Math.round(
      summary.grossSalesMinor / summary.dayCount
    )
    return !best || average > best.average
      ? { weekday, average }
      : best
  }, null)
  if (!strongest) return null
  return {
    label: weekdayLabel(strongest.weekday),
    averageDailyGrossSalesMinor: strongest.average,
  }
})
const trendIntervalDays = computed(() =>
  selectedPeriod.value === '7d'
    ? 1
    : selectedPeriod.value === '30d'
      ? 3
      : 10
)
const currentTrend = computed<FinanceTrendPoint[]>(() => {
  if (demoFinanceReport.value) return demoFinanceReport.value.trend
  return groupTrend(calendarDays.value, trendIntervalDays.value)
})
const previousTrend = computed<FinanceTrendPoint[]>(() =>
  demoFinanceReport.value?.previousTrend ?? []
)

const formattedReportPeriod = computed(() => {
  if (!report.value) return selectedPeriodLabel.value
  const bounds = localPeriodBounds()
  if (!bounds) return selectedPeriodLabel.value
  return `${formatIsoDate(bounds.from)} – ${formatIsoDate(bounds.to)}`
})
const reportAssurances = computed(() => [
  {
    icon: 'i-lucide-badge-check',
    label: 'Completed only',
    value: `${activeCurrencySummary.value?.sale_count.toLocaleString(locale) ?? 0} reconciled sales`,
  },
  {
    icon: 'i-lucide-calendar-clock',
    label: 'Owner-local days',
    value: report.value?.timezone ?? 'Kitchen timezone',
  },
  {
    icon: 'i-lucide-coins',
    label: 'Currency-safe',
    value: currencyOptions.value.length === 1
      ? activeCurrencyCode.value
      : `${currencyOptions.value.length} currencies kept separate`,
  },
  {
    icon: 'i-lucide-refresh-cw',
    label: 'Generated',
    value: report.value
      ? formatInstant(report.value.generated_at, report.value.timezone)
      : '—',
  },
])

watch(
  currencyOptions,
  currencies => {
    if (!currencies.includes(activeCurrencyCode.value)) {
      activeCurrencyCode.value = currencies[0] ?? ''
    }
  },
  { immediate: true }
)
watch(
  calendarDays,
  days => {
    if (!days.some(day => day.date === selectedDate.value)) {
      selectedDate.value = days.at(-1)?.date ?? ''
    }
  },
  { immediate: true }
)

function localPeriodBounds() {
  const value = report.value
  if (!value) return null
  if (demoFinanceReport.value) {
    return {
      from: demoFinanceReport.value.periodFrom,
      to: addIsoDays(demoFinanceReport.value.periodTo, -1),
    }
  }
  const from = instantIsoDate(value.period.from, value.timezone)
  const toTimestamp = new Date(value.period.to).getTime() - 1
  const to = Number.isFinite(toTimestamp)
    ? instantIsoDate(new Date(toTimestamp).toISOString(), value.timezone)
    : ''
  if (from && to && from <= to) return { from, to }
  const dates = value.daily.map(day => day.date).sort()
  return dates.length
    ? { from: dates[0], to: dates[dates.length - 1] }
    : null
}

function withCurrencyBucket(
  day: KitchenFinanceDailySummary,
  currencyCode: string
): KitchenFinanceDailySummary {
  if (currencySummary(day, currencyCode)) return day
  return {
    ...day,
    currencies: [
      ...day.currencies,
      emptyCurrencySummary(currencyCode),
    ],
  }
}

function emptyFinanceDay(
  date: string,
  currencyCode: string
): KitchenFinanceDailySummary {
  return {
    date,
    sale_count: 0,
    currencies: [emptyCurrencySummary(currencyCode)],
  }
}

function emptyCurrencySummary(
  currencyCode: string
): KitchenFinanceCurrencySummary {
  const money = {
    amount_minor: 0,
    currency_code: currencyCode,
  }
  return {
    currency_code: currencyCode,
    sale_count: 0,
    gross_sales: { ...money },
    average_sale: { ...money },
    item_quantity: 0,
    item_sales: { ...money },
    delivery_fees: { ...money },
    items: [],
  }
}

function currencySummary(
  day: KitchenFinanceDailySummary,
  currencyCode: string
) {
  return day.currencies.find(
    summary => summary.currency_code === currencyCode
  )
}

function groupTrend(
  days: readonly KitchenFinanceDailySummary[],
  intervalDays: number
): FinanceTrendPoint[] {
  const groups: KitchenFinanceDailySummary[][] = []
  for (let index = 0; index < days.length; index += intervalDays) {
    groups.push(days.slice(index, index + intervalDays))
  }
  return groups.map(group => {
    const summaries = group.map(day =>
      currencySummary(day, activeCurrencyCode.value)
    )
    const fromDate = group[0].date
    const toDate = group[group.length - 1].date
    return {
      id: `${fromDate}:${toDate}`,
      fromDate,
      toDate,
      saleCount: summaries.reduce(
        (total, summary) => total + (summary?.sale_count ?? 0),
        0
      ),
      grossSalesMinor: summaries.reduce(
        (total, summary) =>
          total + (summary?.gross_sales.amount_minor ?? 0),
        0
      ),
    }
  })
}

function addIsoDays(date: string, days: number) {
  const timestamp = Date.parse(`${date}T00:00:00.000Z`)
  return new Date(timestamp + days * 86_400_000).toISOString().slice(0, 10)
}

function instantIsoDate(value: string, timezone: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    year: 'numeric',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(item => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function formatIsoDate(value: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00.000Z`))
}

function formatInstant(value: string, timezone: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    timeZone: timezone,
  }).format(new Date(value))
}

function isoDateWeekday(value: string) {
  return new Date(`${value}T00:00:00.000Z`).getUTCDay()
}

function weekdayLabel(weekday: number) {
  const sunday = Date.UTC(2026, 0, 4)
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    weekday: 'long',
  }).format(new Date(sunday + weekday * 86_400_000))
}
</script>

<style scoped>
.kitchen-finance-report__controls {
  position: relative;
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
  overflow: hidden;
}

.kitchen-finance-report__controls::before {
  position: absolute;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
  content: "";
  filter: blur(3rem);
  inset: -14rem auto auto 42%;
  pointer-events: none;
}

.kitchen-finance-report__control,
.kitchen-finance-report__status {
  position: relative;
  min-width: 0;
}

.kitchen-finance-report__control > p {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.kitchen-finance-report__control > span {
  display: block;
  margin: calc(var(--spacing) * 0.5) 0 calc(var(--spacing) * 2.5);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.kitchen-finance-report__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.kitchen-finance-report__period {
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.kitchen-finance-report__content,
.kitchen-finance-report__loading {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
}

.kitchen-finance-report__overview,
.kitchen-finance-report__daily {
  display: grid;
  min-width: 0;
  align-items: start;
  gap: calc(var(--spacing) * 4);
}

.kitchen-finance-report__assurance {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-elevated);
}

.kitchen-finance-report__assurance-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 2.5);
  padding: calc(var(--spacing) * 3.5);
  border-top: 1px solid var(--ui-border);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.kitchen-finance-report__assurance-item:first-child {
  border-top: 0;
}

.kitchen-finance-report__assurance-item svg {
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  color: var(--ui-primary);
}

.kitchen-finance-report__assurance-item span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.kitchen-finance-report__assurance-item strong {
  display: block;
  margin-bottom: calc(var(--spacing) * 0.5);
  color: var(--ui-text-highlighted);
  font-size: var(--text-xs);
}

@media (min-width: 40rem) {
  .kitchen-finance-report__controls {
    grid-template-columns: repeat(2, minmax(0, auto)) minmax(16rem, 1fr);
    align-items: end;
  }

  .kitchen-finance-report__status {
    grid-column: -2 / -1;
    justify-content: flex-end;
  }

  .kitchen-finance-report__assurance {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kitchen-finance-report__assurance-item:nth-child(2) {
    border-top: 0;
  }

  .kitchen-finance-report__assurance-item:nth-child(even) {
    border-left: 1px solid var(--ui-border);
  }
}

@media (min-width: 80rem) {
  .kitchen-finance-report__overview {
    grid-template-columns: minmax(0, 1fr) 21rem;
  }

  .kitchen-finance-report__overview > :last-child {
    position: sticky;
    top: calc(var(--spacing) * 4);
  }

  .kitchen-finance-report__daily {
    grid-template-columns: minmax(0, 1.35fr) minmax(22rem, 0.65fr);
  }

  .kitchen-finance-report__assurance {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .kitchen-finance-report__assurance-item {
    border-top: 0;
    border-left: 1px solid var(--ui-border);
  }

  .kitchen-finance-report__assurance-item:first-child {
    border-left: 0;
  }
}
</style>
