<template>
  <UCard variant="subtle" class="overflow-hidden">
    <template #header>
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <UIcon
                name="i-lucide-calendar-days"
                class="size-5"
                aria-hidden="true"
              />
            </span>
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-highlighted">
                Daily sales
              </h2>
              <p class="mt-0.5 text-xs text-muted">
                Select a day to inspect its item roundup.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="neutral" variant="soft" icon="i-lucide-clock-3">
            {{ timezone }}
          </UBadge>
          <UBadge color="neutral" variant="outline">
            {{ currencyCode }}
          </UBadge>
        </div>
      </div>

      <div class="mt-5 flex items-center justify-between gap-3">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          :disabled="!canShowPreviousMonth"
          :aria-label="`Show ${previousMonthLabel}`"
          @click="showPreviousMonth"
        />

        <div class="text-center">
          <p class="text-sm font-semibold text-highlighted">
            {{ visibleMonthLabel }}
          </p>
          <p class="mt-0.5 text-xs text-dimmed">
            {{ representedRangeLabel }}
          </p>
        </div>

        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          :disabled="!canShowNextMonth"
          :aria-label="`Show ${nextMonthLabel}`"
          @click="showNextMonth"
        />
      </div>
    </template>

    <div
      v-if="hasRepresentedDays"
      class="-m-4 sm:-m-6"
    >
      <div class="p-4 sm:p-6">
        <div
          role="group"
          :aria-label="`${visibleMonthLabel} sales calendar in ${timezone}`"
          class="grid grid-cols-7 gap-1 sm:gap-2"
        >
          <div
            v-for="weekday in weekdayLabels"
            :key="weekday"
            class="pb-1 text-center text-xs font-semibold tracking-wider text-dimmed uppercase sm:px-2"
            aria-hidden="true"
          >
            {{ weekday }}
          </div>

          <button
            v-for="cell in calendarCells"
            :key="cell.date"
            type="button"
            :disabled="!cell.withinRange"
            :aria-label="cell.ariaLabel"
            :aria-pressed="cell.date === selectedDate"
            class="group relative min-h-14 overflow-hidden rounded-lg border p-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed sm:min-h-32 sm:rounded-xl sm:p-3"
            :class="cellClasses(cell)"
            @click="selectDate(cell)"
          >
                <span
                  v-if="cell.hasSales && cell.withinRange"
                  class="absolute inset-x-0 bottom-0 h-1 bg-primary transition-all"
                  :class="heatBarClass(cell.heatLevel)"
                  aria-hidden="true"
                />

                <span class="flex items-start justify-between gap-2">
                  <span
                    class="flex size-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                    :class="
                      cell.date === selectedDate
                        ? 'bg-primary text-inverted'
                        : 'text-highlighted'
                    "
                  >
                    {{ cell.dayNumber }}
                  </span>
                  <UIcon
                    v-if="cell.date === selectedDate"
                    name="i-lucide-check"
                    class="mt-1 hidden size-4 text-primary sm:block"
                    aria-hidden="true"
                  />
                </span>

                <template v-if="cell.withinRange && cell.hasSales">
                  <span
                    class="mt-3 hidden truncate text-sm font-bold tracking-tight text-highlighted tabular-nums sm:block"
                  >
                    {{ cell.grossSalesLabel }}
                  </span>
                  <span
                    class="mt-2 hidden items-center gap-1.5 text-xs font-medium text-muted sm:flex"
                  >
                    <UIcon
                      name="i-lucide-receipt-text"
                      class="size-3.5"
                      aria-hidden="true"
                    />
                    {{ cell.saleCountLabel }}
                  </span>
                  <span
                    class="mt-1 hidden items-center gap-1.5 text-xs font-medium text-muted sm:flex"
                  >
                    <UIcon
                      name="i-lucide-utensils"
                      class="size-3.5"
                      aria-hidden="true"
                    />
                    {{ cell.itemQuantityLabel }}
                  </span>
                </template>

                <span
                  v-else-if="cell.withinRange"
                  class="mt-4 hidden text-xs leading-5 text-dimmed sm:block"
                >
                  No completed sales
                </span>
          </button>
        </div>

        <div
          class="mt-5 flex flex-col gap-3 border-t border-default pt-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Darker days recorded more gross sales in this report.
          </p>
          <div class="flex items-center gap-2" aria-label="Sales intensity">
            <span>Lower</span>
            <span
              v-for="level in 4"
              :key="level"
              class="size-3 rounded-sm bg-primary"
              :class="heatBarClass(level)"
              aria-hidden="true"
            />
            <span>Higher</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"
    >
      <span
        class="flex size-12 items-center justify-center rounded-full bg-elevated text-muted"
      >
        <UIcon
          name="i-lucide-calendar-x-2"
          class="size-6"
          aria-hidden="true"
        />
      </span>
      <p class="mt-4 text-sm font-semibold text-highlighted">
        No daily sales available
      </p>
      <p class="mt-1 max-w-sm text-xs leading-5 text-muted">
        Daily totals will appear here when the selected report contains
        completed sales.
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { KitchenFinanceDailySummary } from '../../models/kitchen/finance-report.model'
import { formatFinancialMinorAmount } from 'fireux-finance/runtime/utils/money.ts'

type LocalDateParts = {
  year: number
  month: number
  day: number
}

type CalendarCell = {
  date: string
  dayNumber: number
  withinRange: boolean
  inVisibleMonth: boolean
  hasSales: boolean
  heatLevel: number
  grossSalesLabel: string
  saleCountLabel: string
  itemQuantityLabel: string
  ariaLabel: string
}

const props = withDefaults(defineProps<{
  currencyCode: string
  days: readonly KitchenFinanceDailySummary[]
  locale?: string
  selectedDate?: string | null
  timezone: string
}>(), {
  locale: 'en-GB',
  selectedDate: null,
})

const emit = defineEmits<{
  'update:selectedDate': [value: string]
}>()

const visibleMonth = ref('')

const dayByDate = computed(() => {
  const entries = props.days
    .filter(day => parseDateKey(day.date))
    .map(day => [day.date, day] as const)

  return new Map(entries)
})

const representedDates = computed(() =>
  Array.from(dayByDate.value.keys()).sort()
)
const firstRepresentedDate = computed(() => representedDates.value[0] || '')
const lastRepresentedDate = computed(() =>
  representedDates.value.at(-1) || ''
)
const firstRepresentedMonth = computed(() =>
  firstRepresentedDate.value.slice(0, 7)
)
const lastRepresentedMonth = computed(() =>
  lastRepresentedDate.value.slice(0, 7)
)
const hasRepresentedDays = computed(() => representedDates.value.length > 0)

watch(
  [
    firstRepresentedMonth,
    lastRepresentedMonth,
  ],
  () => {
    if (!hasRepresentedDays.value) {
      visibleMonth.value = ''
      return
    }

    if (
      !visibleMonth.value
      || visibleMonth.value < firstRepresentedMonth.value
      || visibleMonth.value > lastRepresentedMonth.value
    ) {
      visibleMonth.value = preferredVisibleMonth()
    }
  },
  { immediate: true }
)

watch(
  () => props.selectedDate,
  (selectedDate) => {
    if (!selectedDate || !isWithinRepresentedRange(selectedDate)) return
    visibleMonth.value = selectedDate.slice(0, 7)
  }
)

const weekdayLabels = computed(() => {
  const formatter = new Intl.DateTimeFormat(props.locale, {
    weekday: 'short',
    timeZone: 'UTC',
  })

  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(Date.UTC(2024, 0, 1 + index)))
  )
})

const visibleMonthLabel = computed(() =>
  formatMonthLabel(visibleMonth.value)
)
const previousMonthLabel = computed(() =>
  formatMonthLabel(shiftMonth(visibleMonth.value, -1))
)
const nextMonthLabel = computed(() =>
  formatMonthLabel(shiftMonth(visibleMonth.value, 1))
)
const representedRangeLabel = computed(() => {
  if (!hasRepresentedDays.value) return 'No represented dates'

  const firstDateParts = parseDateKey(firstRepresentedDate.value)
  const lastDateParts = parseDateKey(lastRepresentedDate.value)
  return `${formatDateLabel(firstRepresentedDate.value, {
    day: 'numeric',
    month: 'short',
    ...(firstDateParts?.year !== lastDateParts?.year
      ? { year: 'numeric' as const }
      : {}),
  })}–${formatDateLabel(lastRepresentedDate.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`
})

const canShowPreviousMonth = computed(() =>
  Boolean(
    visibleMonth.value
    && firstRepresentedMonth.value
    && visibleMonth.value > firstRepresentedMonth.value
  )
)
const canShowNextMonth = computed(() =>
  Boolean(
    visibleMonth.value
    && lastRepresentedMonth.value
    && visibleMonth.value < lastRepresentedMonth.value
  )
)

const maximumGrossSalesMinor = computed(() => {
  let maximum = 0
  for (const day of dayByDate.value.values()) {
    const currency = findCurrency(day)
    maximum = Math.max(maximum, currency?.gross_sales.amount_minor || 0)
  }
  return maximum
})

const calendarCells = computed<CalendarCell[]>(() => {
  const month = parseMonthKey(visibleMonth.value)
  if (!month) return []

  const firstOfMonth = new Date(Date.UTC(month.year, month.month - 1, 1))
  const mondayOffset = (firstOfMonth.getUTCDay() + 6) % 7
  const numberOfDays = new Date(
    Date.UTC(month.year, month.month, 0)
  ).getUTCDate()
  const cellCount = Math.ceil((mondayOffset + numberOfDays) / 7) * 7
  const firstCellDate = addDays(
    dateKeyFromParts({
      year: month.year,
      month: month.month,
      day: 1,
    }),
    -mondayOffset
  )

  return Array.from({ length: cellCount }, (_, index) =>
    buildCell(addDays(firstCellDate, index), visibleMonth.value)
  )
})

function preferredVisibleMonth() {
  if (
    props.selectedDate
    && isWithinRepresentedRange(props.selectedDate)
  ) {
    return props.selectedDate.slice(0, 7)
  }
  return lastRepresentedMonth.value
}

function buildCell(date: string, monthKey: string): CalendarCell {
  const parts = parseDateKey(date)
  const withinRange = isWithinRepresentedRange(date)
  const day = dayByDate.value.get(date)
  const currency = day ? findCurrency(day) : undefined
  const hasSales = Boolean(currency && currency.sale_count > 0)
  const grossSalesMinor = currency?.gross_sales.amount_minor || 0
  const saleCount = currency?.sale_count || 0
  const itemQuantity = currency?.item_quantity || 0
  const dateLabel = formatDateLabel(date, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return {
    date,
    dayNumber: parts?.day || 0,
    withinRange,
    inVisibleMonth: date.slice(0, 7) === monthKey,
    hasSales,
    heatLevel: calculateHeatLevel(grossSalesMinor),
    grossSalesLabel: formatMoney(grossSalesMinor),
    saleCountLabel: `${formatCount(saleCount)} ${saleCount === 1 ? 'sale' : 'sales'}`,
    itemQuantityLabel: `${formatCount(itemQuantity)} ${itemQuantity === 1 ? 'item' : 'items'}`,
    ariaLabel: !withinRange
      ? `${dateLabel}. Outside the represented report range.`
      : hasSales
        ? `${dateLabel}. ${formatMoney(grossSalesMinor)} gross sales. ${formatCount(saleCount)} completed ${saleCount === 1 ? 'sale' : 'sales'}. ${formatCount(itemQuantity)} ${itemQuantity === 1 ? 'item' : 'items'} sold.`
        : `${dateLabel}. No completed sales in ${props.currencyCode}.`,
  }
}

function findCurrency(day: KitchenFinanceDailySummary) {
  return day.currencies.find(
    currency => currency.currency_code === props.currencyCode
  )
}

function calculateHeatLevel(amountMinor: number) {
  if (amountMinor <= 0 || maximumGrossSalesMinor.value <= 0) return 0
  return Math.max(
    1,
    Math.min(4, Math.ceil((amountMinor / maximumGrossSalesMinor.value) * 4))
  )
}

function formatMoney(amountMinor: number) {
  return formatFinancialMinorAmount(amountMinor, props.currencyCode, {
    locales: props.locale,
  })
}

function formatCount(value: number) {
  return value.toLocaleString(props.locale)
}

function cellClasses(cell: CalendarCell) {
  if (!cell.withinRange) {
    return 'border-transparent bg-elevated/20 text-dimmed opacity-45'
  }
  if (cell.date === props.selectedDate) {
    return 'border-primary/50 bg-primary/10 shadow-sm ring-2 ring-inset ring-primary/30'
  }

  const monthTone = cell.inVisibleMonth
    ? 'opacity-100'
    : 'opacity-65'
  const heatTone = {
    0: 'border-default bg-default hover:border-accented hover:bg-elevated/60',
    1: 'border-primary/10 bg-primary/5 hover:border-primary/30 hover:bg-primary/10',
    2: 'border-primary/15 bg-primary/8 hover:border-primary/35 hover:bg-primary/12',
    3: 'border-primary/20 bg-primary/10 hover:border-primary/40 hover:bg-primary/15',
    4: 'border-primary/30 bg-primary/15 hover:border-primary/50 hover:bg-primary/20',
  }[cell.heatLevel]

  return `${monthTone} ${heatTone}`
}

function heatBarClass(level: number) {
  return {
    1: 'opacity-25',
    2: 'opacity-45',
    3: 'opacity-70',
    4: 'opacity-100',
  }[level] || 'opacity-0'
}

function selectDate(cell: CalendarCell) {
  if (!cell.withinRange) return
  emit('update:selectedDate', cell.date)
  if (!cell.inVisibleMonth) visibleMonth.value = cell.date.slice(0, 7)
}

function showPreviousMonth() {
  if (!canShowPreviousMonth.value) return
  visibleMonth.value = shiftMonth(visibleMonth.value, -1)
}

function showNextMonth() {
  if (!canShowNextMonth.value) return
  visibleMonth.value = shiftMonth(visibleMonth.value, 1)
}

function isWithinRepresentedRange(date: string) {
  return Boolean(
    parseDateKey(date)
    && firstRepresentedDate.value
    && lastRepresentedDate.value
    && date >= firstRepresentedDate.value
    && date <= lastRepresentedDate.value
  )
}

function parseDateKey(value: string): LocalDateParts | null {
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

function parseMonthKey(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  return { year, month }
}

function dateKeyFromParts(parts: LocalDateParts) {
  return [
    String(parts.year).padStart(4, '0'),
    String(parts.month).padStart(2, '0'),
    String(parts.day).padStart(2, '0'),
  ].join('-')
}

function addDays(dateKey: string, amount: number) {
  const parts = parseDateKey(dateKey)
  if (!parts) return dateKey
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + amount))
  return dateKeyFromParts({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  })
}

function shiftMonth(monthKey: string, amount: number) {
  const month = parseMonthKey(monthKey)
  if (!month) return ''
  const date = new Date(Date.UTC(month.year, month.month - 1 + amount, 1))
  return [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
  ].join('-')
}

function formatMonthLabel(monthKey: string) {
  const month = parseMonthKey(monthKey)
  if (!month) return 'Daily sales'
  return new Intl.DateTimeFormat(props.locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(month.year, month.month - 1, 1)))
}

function formatDateLabel(
  dateKey: string,
  options: Pick<
    Intl.DateTimeFormatOptions,
    'day' | 'month' | 'weekday' | 'year'
  >
) {
  const parts = parseDateKey(dateKey)
  if (!parts) return dateKey
  return new Intl.DateTimeFormat(props.locale, {
    ...options,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)))
}
</script>
