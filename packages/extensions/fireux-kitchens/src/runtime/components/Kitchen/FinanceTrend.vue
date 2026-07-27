<template>
  <FinanceReportTrend :size="size" :trend="trendView" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FinanceReportTrend from 'fireux-finance/runtime/components/Finance/ReportTrend.vue'
import type {
  FinancialReportComparisonTone,
  FinancialReportTrendView,
} from 'fireux-finance/runtime/models/report-presentation.model.ts'
import {
  formatFinancialMinorAmount,
} from 'fireux-finance/runtime/utils/money.ts'

type KitchenFinanceTrendPoint = {
  id: string
  fromDate: string
  toDate: string
  saleCount: number
  grossSalesMinor: number
}

const props = withDefaults(defineProps<{
  averageDailyGrossSalesMinor?: number | null
  bestDay?: {
    date: string
    saleCount: number
    grossSalesMinor: number
  } | null
  comparisonPercent?: number | null
  currencyCode: string
  intervalDays: number
  locale?: string
  periodLabel: string
  points: readonly KitchenFinanceTrendPoint[]
  previousPoints?: readonly KitchenFinanceTrendPoint[]
  showInsights?: boolean
  size?: 'md' | 'lg'
}>(), {
  averageDailyGrossSalesMinor: null,
  bestDay: null,
  comparisonPercent: null,
  locale: 'en-GB',
  previousPoints: () => [],
  showInsights: true,
  size: 'md',
})

const money = (amountMinor: number) =>
  formatFinancialMinorAmount(
    amountMinor,
    props.currencyCode,
    { locales: props.locale }
  )
const dateFormatter = computed(() =>
  new Intl.DateTimeFormat(props.locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
)

const trendView = computed<FinancialReportTrendView>(() => ({
  title: 'Gross sales trend',
  description:
    props.intervalDays === 1
      ? 'Daily totals from completed service.'
      : `${props.intervalDays}-day totals from completed service.`,
  ...(props.comparisonPercent !== null
    ? {
        comparison: {
          label: `vs previous ${props.periodLabel.toLowerCase()}`,
          tone: comparisonTone(props.comparisonPercent),
          value: formatComparison(props.comparisonPercent),
        },
      }
    : {}),
  series: {
    primaryLabel: 'Selected period',
    ...(props.previousPoints.length
      ? { comparisonLabel: 'Previous period' }
      : {}),
  },
  points: props.points.map(point => ({
    id: point.id,
    label: formatRange(point.fromDate, point.toDate),
    value: point.grossSalesMinor,
    valueLabel: money(point.grossSalesMinor),
    secondaryLabel:
      `${point.saleCount.toLocaleString(props.locale)} completed ${
        point.saleCount === 1 ? 'sale' : 'sales'
      }`,
  })),
  comparisonPoints: props.previousPoints.map(point => ({
    id: point.id,
    label: formatRange(point.fromDate, point.toDate),
    value: point.grossSalesMinor,
    valueLabel: money(point.grossSalesMinor),
    secondaryLabel:
      `${point.saleCount.toLocaleString(props.locale)} completed ${
        point.saleCount === 1 ? 'sale' : 'sales'
      }`,
  })),
  insights: props.showInsights
    ? [
        ...(props.bestDay
          ? [{
              label: 'Best day',
              value: money(props.bestDay.grossSalesMinor),
              description:
                `${formatDate(props.bestDay.date)} · `
                + `${props.bestDay.saleCount.toLocaleString(props.locale)} completed sales`,
            }]
          : []),
        ...(props.averageDailyGrossSalesMinor !== null
          ? [{
              label: 'Daily average',
              value: money(props.averageDailyGrossSalesMinor),
              description:
                `Across the selected ${props.periodLabel.toLowerCase()}.`,
            }]
          : []),
      ]
    : [],
}))

function formatDate(value: string) {
  return dateFormatter.value.format(new Date(`${value}T00:00:00.000Z`))
}

function formatRange(from: string, to: string) {
  if (from === to) return formatDate(from)
  return `${formatDate(from)} – ${formatDate(to)}`
}

function formatComparison(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString(props.locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  })}%`
}

function comparisonTone(value: number): FinancialReportComparisonTone {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}
</script>
