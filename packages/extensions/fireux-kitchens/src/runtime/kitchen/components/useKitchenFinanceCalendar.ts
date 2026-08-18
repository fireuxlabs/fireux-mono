import { computed, ref, watch } from 'vue'
import { createKitchenFinanceCalendarDateTools } from './finance-calendar-date'
import type { KitchenFinanceDailySummary } from '../models/finance-report.model.ts'
import { formatFinancialMinorAmount } from 'fireux-finance/runtime/utils/money'

export function useKitchenFinanceCalendar(
  props: {
    currencyCode: string
    days: KitchenFinanceDailySummary[]
    locale: string
    selectedDate: string
    timezone: string
  },
  emit: (event: 'update:selectedDate', date: string) => void
) {
  const {
    parseDateKey,
    parseMonthKey,
    dateKeyFromParts,
    addDays,
    shiftMonth,
    formatMonthLabel,
    formatDateLabel,
  } = createKitchenFinanceCalendarDateTools(props)

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

  const visibleMonth = ref('')

  const dayByDate = computed(() => {
    const entries = props.days
      .filter((day) => parseDateKey(day.date))
      .map((day) => [day.date, day] as const)

    return new Map(entries)
  })

  const representedDates = computed(() =>
    Array.from(dayByDate.value.keys()).sort()
  )

  const firstRepresentedDate = computed(() => representedDates.value[0] || '')

  const lastRepresentedDate = computed(
    () => representedDates.value.at(-1) || ''
  )

  const firstRepresentedMonth = computed(() =>
    firstRepresentedDate.value.slice(0, 7)
  )

  const lastRepresentedMonth = computed(() =>
    lastRepresentedDate.value.slice(0, 7)
  )

  const hasRepresentedDays = computed(() => representedDates.value.length > 0)

  watch(
    [firstRepresentedMonth, lastRepresentedMonth],
    () => {
      if (!hasRepresentedDays.value) {
        visibleMonth.value = ''
        return
      }

      if (
        !visibleMonth.value ||
        visibleMonth.value < firstRepresentedMonth.value ||
        visibleMonth.value > lastRepresentedMonth.value
      ) {
        visibleMonth.value = preferredVisibleMonth()
      }
    },
    { immediate: true }
  )

  watch(
    () => props.selectedDate,
    (selectedDate: string) => {
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

  const visibleMonthLabel = computed(() => formatMonthLabel(visibleMonth.value))

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
      visibleMonth.value &&
        firstRepresentedMonth.value &&
        visibleMonth.value > firstRepresentedMonth.value
    )
  )

  const canShowNextMonth = computed(() =>
    Boolean(
      visibleMonth.value &&
        lastRepresentedMonth.value &&
        visibleMonth.value < lastRepresentedMonth.value
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
    if (props.selectedDate && isWithinRepresentedRange(props.selectedDate)) {
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
      (currency) => currency.currency_code === props.currencyCode
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

    const monthTone = cell.inVisibleMonth ? 'opacity-100' : 'opacity-65'
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
    return (
      {
        1: 'opacity-25',
        2: 'opacity-45',
        3: 'opacity-70',
        4: 'opacity-100',
      }[level] || 'opacity-0'
    )
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
      parseDateKey(date) &&
        firstRepresentedDate.value &&
        lastRepresentedDate.value &&
        date >= firstRepresentedDate.value &&
        date <= lastRepresentedDate.value
    )
  }

  

  

  

  

  

  

  

  return {
    visibleMonth,
    dayByDate,
    representedDates,
    firstRepresentedDate,
    lastRepresentedDate,
    firstRepresentedMonth,
    lastRepresentedMonth,
    hasRepresentedDays,
    weekdayLabels,
    visibleMonthLabel,
    previousMonthLabel,
    nextMonthLabel,
    representedRangeLabel,
    canShowPreviousMonth,
    canShowNextMonth,
    maximumGrossSalesMinor,
    calendarCells,
    preferredVisibleMonth,
    buildCell,
    findCurrency,
    calculateHeatLevel,
    formatMoney,
    formatCount,
    cellClasses,
    heatBarClass,
    selectDate,
    showPreviousMonth,
    showNextMonth,
    isWithinRepresentedRange,
    parseDateKey,
    parseMonthKey,
    dateKeyFromParts,
    addDays,
    shiftMonth,
    formatMonthLabel,
    formatDateLabel,
  }
}
