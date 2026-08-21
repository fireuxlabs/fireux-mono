<template>
  <FinanceReportMetricSummary :compact="compact" :summary="summary" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FinanceReportMetricSummary from 'fireux-finance/runtime/components/Finance/ReportMetricSummary.vue'
import type {
  FinancialReportComparisonTone,
  FinancialReportMetricView,
  FinancialReportMetricSummaryView,
} from 'fireux-finance/runtime/models/report-presentation.model'
import { formatFinancialMinorAmount } from 'fireux-finance/runtime/utils/money'

const props = withDefaults(
  defineProps<{
    averageDailyGrossSalesMinor?: number | null
    averageSaleMinor: number
    compact?: boolean
    comparison?: {
      grossSalesPercent: number
      saleCountPercent: number
      averageSalePercent: number
    } | null
    currencyCode: string
    grossSalesMinor: number
    itemQuantity?: number | null
    locale?: string
    periodLabel?: string
    saleCount: number
  }>(),
  {
    averageDailyGrossSalesMinor: null,
    compact: false,
    comparison: null,
    itemQuantity: null,
    locale: 'en-GB',
    periodLabel: '',
  }
)

const summary = computed<FinancialReportMetricSummaryView>(() => {
  const supporting: FinancialReportMetricView[] = [
    {
      label: 'Completed sales',
      value: props.saleCount.toLocaleString(props.locale),
      icon: 'i-lucide-receipt-text',
      ...(props.comparison
        ? {
            comparison: comparisonView(
              props.comparison.saleCountPercent,
              'vs previous period'
            ),
          }
        : {}),
    },
    {
      label: 'Average sale',
      value: formatFinancialMinorAmount(
        props.averageSaleMinor,
        props.currencyCode,
        { locales: props.locale }
      ),
      icon: 'i-lucide-chart-column',
      ...(props.comparison
        ? {
            comparison: comparisonView(
              props.comparison.averageSalePercent,
              'vs previous period'
            ),
          }
        : {}),
    },
  ]
  if (props.itemQuantity !== null) {
    supporting.push({
      label: 'Items sold',
      value: props.itemQuantity.toLocaleString(props.locale),
      icon: 'i-lucide-utensils',
      description: 'Across completed sales.',
    })
  }
  if (props.averageDailyGrossSalesMinor !== null) {
    supporting.push({
      label: 'Daily average',
      value: formatFinancialMinorAmount(
        props.averageDailyGrossSalesMinor,
        props.currencyCode,
        { locales: props.locale }
      ),
      icon: 'i-lucide-calendar-days',
      description: 'Across the selected period.',
    })
  }

  return {
    meta: [
      props.currencyCode,
      ...(props.periodLabel ? [props.periodLabel] : []),
    ],
    primary: {
      label: 'Gross sales',
      value: formatFinancialMinorAmount(
        props.grossSalesMinor,
        props.currencyCode,
        { locales: props.locale }
      ),
      description: 'Recorded from completed service.',
      ...(props.comparison
        ? {
            comparison: comparisonView(
              props.comparison.grossSalesPercent,
              'vs previous period'
            ),
          }
        : {}),
    },
    supporting,
  }
})

function comparisonView(value: number, label: string) {
  return {
    label,
    tone: comparisonTone(value),
    value: formatComparison(value),
  }
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
