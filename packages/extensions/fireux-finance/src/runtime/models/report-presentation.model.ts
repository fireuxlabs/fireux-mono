/**
 * Product-neutral, already-labelled report metric for shared presentation.
 *
 * Producing domains own the meaning and create these view models. Finance
 * presentation never infers labels, queries records, or acquires authority.
 */
export type FinancialReportComparisonTone =
  | 'positive'
  | 'negative'
  | 'neutral'

export type FinancialReportMetricView = {
  label: string
  value: string
  description?: string
  icon?: string
  comparison?: {
    label: string
    tone: FinancialReportComparisonTone
    value: string
  }
}

export type FinancialReportMetricSummaryView = {
  meta?: readonly string[]
  primary: FinancialReportMetricView
  supporting?: readonly FinancialReportMetricView[]
}

export type FinancialReportTrendPointView = {
  id: string
  label: string
  value: number
  valueLabel: string
  secondaryLabel?: string
}

export type FinancialReportTrendView = {
  title: string
  description?: string
  comparison?: {
    label: string
    tone: FinancialReportComparisonTone
    value: string
  }
  series?: {
    primaryLabel: string
    comparisonLabel?: string
  }
  points: readonly FinancialReportTrendPointView[]
  comparisonPoints?: readonly FinancialReportTrendPointView[]
  insights?: readonly FinancialReportMetricView[]
}
