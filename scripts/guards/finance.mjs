// @fireux-script
// last_used: 2026-07-27
// usage_note: validates the product-neutral Finance presentation boundary.
// FILE: scripts/guards/finance.mjs

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const FILES = {
  package:
    'packages/extensions/fireux-finance/package.json',
  presentationModel:
    'packages/extensions/fireux-finance/src/runtime/models/report-presentation.model.ts',
  presentationComponent:
    'packages/extensions/fireux-finance/src/runtime/components/Finance/ReportMetricSummary.vue',
  trendComponent:
    'packages/extensions/fireux-finance/src/runtime/components/Finance/ReportTrend.vue',
  kitchenAdapter:
    'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceSummary.vue',
  kitchenTrendAdapter:
    'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceTrend.vue',
  kitchenCalendar:
    'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceCalendar.vue',
  kitchenDayDetail:
    'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceDayDetail.vue',
  kitchenRoundup:
    'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceRoundup.vue',
  kitchenConsole:
    'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Overview/Finance.vue',
  kitchenReportModel:
    'packages/extensions/fireux-kitchens/src/runtime/models/kitchen/finance-report.model.ts',
  kitchenReportProjection:
    'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/sales/gross-sales-report.ts',
}

function read(repoRoot, file, violations) {
  const filePath = path.join(repoRoot, file)
  if (!existsSync(filePath)) {
    violations.push(`${file}: missing Finance spine file`)
    return ''
  }
  return readFileSync(filePath, 'utf8')
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []
  const presentationModel = read(
    repoRoot,
    FILES.presentationModel,
    violations
  )
  const presentationComponent = read(
    repoRoot,
    FILES.presentationComponent,
    violations
  )
  const trendComponent = read(repoRoot, FILES.trendComponent, violations)
  const kitchenAdapter = read(repoRoot, FILES.kitchenAdapter, violations)
  const kitchenTrendAdapter = read(
    repoRoot,
    FILES.kitchenTrendAdapter,
    violations
  )
  const kitchenCalendar = read(repoRoot, FILES.kitchenCalendar, violations)
  const kitchenDayDetail = read(repoRoot, FILES.kitchenDayDetail, violations)
  const kitchenRoundup = read(repoRoot, FILES.kitchenRoundup, violations)
  const kitchenConsole = read(repoRoot, FILES.kitchenConsole, violations)
  const kitchenReportModel = read(
    repoRoot,
    FILES.kitchenReportModel,
    violations
  )
  const kitchenReportProjection = read(
    repoRoot,
    FILES.kitchenReportProjection,
    violations
  )
  const packageSource = read(repoRoot, FILES.package, violations)

  for (const marker of [
    'FinancialReportMetricView',
    'FinancialReportMetricSummaryView',
    'primary: FinancialReportMetricView',
    'supporting?: readonly FinancialReportMetricView[]',
    'FinancialReportTrendPointView',
    'FinancialReportTrendView',
    'comparison?:',
    'comparisonPoints?:',
  ]) {
    if (!presentationModel.includes(marker)) {
      violations.push(
        `${FILES.presentationModel}: missing product-neutral metric contract (${marker})`
      )
    }
  }

  for (const marker of [
    'aria-label="Finance report period"',
    ':aria-pressed="selectedPeriod === option.value"',
    '<KitchenFinanceSummary',
    '<KitchenFinanceTrend',
    '<KitchenFinanceCalendar',
    '<KitchenFinanceDayDetail',
    '<KitchenFinanceRoundup',
    'report.timezone',
    'activeCurrencyCode',
    '<MoleculesStateCard',
  ]) {
    if (!kitchenConsole.includes(marker)) {
      violations.push(
        `${FILES.kitchenConsole}: missing Kitchen Finance report composition (${marker})`
      )
    }
  }

  if (kitchenConsole.includes('FinancialFact')) {
    violations.push(
      `${FILES.kitchenConsole}: Kitchen Console must not read raw FinancialFacts`
    )
  }

  for (const marker of [
    'summary.primary.label',
    'summary.primary.value',
    'summary.supporting',
    'metric.description',
  ]) {
    if (!presentationComponent.includes(marker)) {
      violations.push(
        `${FILES.presentationComponent}: missing view-model-driven presentation (${marker})`
      )
    }
  }

  for (const marker of [
    'KitchenFinanceItemSummary',
    'KitchenFinanceDailySummary',
    'item_quantity',
    'item_sales',
    'delivery_fees',
    'timezone: string',
    'daily: KitchenFinanceDailySummary[]',
  ]) {
    if (!kitchenReportModel.includes(marker)) {
      violations.push(
        `${FILES.kitchenReportModel}: missing bounded Kitchen report contract (${marker})`
      )
    }
  }

  for (const marker of [
    'KITCHEN_GROSS_SALES_REPORT_MAX_DAYS',
    'KITCHEN_GROSS_SALES_REPORT_MAX_SALES',
    'KITCHEN_GROSS_SALES_REPORT_MAX_ITEM_GROUPS',
    'KITCHEN_GROSS_SALES_REPORT_MAX_LINES_PER_SALE',
    'KITCHEN_GROSS_SALES_REPORT_MAX_LINES',
    'requireKitchenGrossSalesReportPeriodRange',
    'requireKitchenOrderPricing',
    'localDateFormatter',
    'reconcileDailySummaries',
    'item_sales',
    'delivery_fees',
  ]) {
    if (!kitchenReportProjection.includes(marker)) {
      violations.push(
        `${FILES.kitchenReportProjection}: missing reconciled Kitchen report projection (${marker})`
      )
    }
  }

  const kitchenPresentations = [
    [FILES.kitchenCalendar, kitchenCalendar, [
      'Daily sales',
      'update:selectedDate',
      'currency.currency_code',
      'formatFinancialMinorAmount',
    ]],
    [FILES.kitchenDayDetail, kitchenDayDetail, [
      'Daily roundup',
      'Item roundup',
      'item_sales',
      'delivery_fees',
      'formatFinancialMinorAmount',
    ]],
    [FILES.kitchenRoundup, kitchenRoundup, [
      'Period roundup',
      'Top item',
      'Strongest weekday',
      'formatFinancialMinorAmount',
    ]],
  ]
  for (const [file, source, markers] of kitchenPresentations) {
    for (const marker of markers) {
      if (!source.includes(marker)) {
        violations.push(
          `${file}: missing Kitchen-owned Finance presentation (${marker})`
        )
      }
    }
  }

  for (const marker of [
    'trend.points',
    'trend.comparison',
    'trend.insights',
    'selectedPoint.valueLabel',
  ]) {
    if (!trendComponent.includes(marker)) {
      violations.push(
        `${FILES.trendComponent}: missing view-model-driven trend presentation (${marker})`
      )
    }
  }

  for (const forbidden of [
    '$fetch',
    'Firestore',
    'Kitchen',
    'Gross sales',
    'Completed sales',
    'Average sale',
  ]) {
    if (
      presentationModel.includes(forbidden)
      || presentationComponent.includes(forbidden)
      || trendComponent.includes(forbidden)
    ) {
      violations.push(
        `${FILES.presentationComponent}: shared Finance presentation acquired domain/data authority (${forbidden})`
      )
    }
  }

  for (const marker of [
    "from 'fireux-finance/runtime/components/Finance/ReportTrend.vue'",
    'formatFinancialMinorAmount',
    "title: 'Gross sales trend'",
    "label: 'Best day'",
    "label: 'Daily average'",
    'vs previous',
  ]) {
    if (!kitchenTrendAdapter.includes(marker)) {
      violations.push(
        `${FILES.kitchenTrendAdapter}: missing Kitchen-owned trend adapter contract (${marker})`
      )
    }
  }

  for (const marker of [
    "from 'fireux-finance/runtime/components/Finance/ReportMetricSummary.vue'",
    'formatFinancialMinorAmount',
    "label: 'Gross sales'",
    "label: 'Completed sales'",
    "label: 'Average sale'",
    "description: 'Recorded from completed service.'",
  ]) {
    if (!kitchenAdapter.includes(marker)) {
      violations.push(
        `${FILES.kitchenAdapter}: missing Kitchen-owned Finance adapter contract (${marker})`
      )
    }
  }

  const packageJson = packageSource ? JSON.parse(packageSource) : {}
  if (
    packageJson.dependencies?.['fireux-kitchens']
    || packageJson.dependencies?.['fireux-properties']
  ) {
    violations.push(
      `${FILES.package}: Finance must not depend on a producing domain`
    )
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] Shared Finance spine drifted:',
        ...violations.map(violation => `- ${violation}`),
      ].join('\n')
    )
  }

  console.log('[guard] ✅ shared Finance presentation remains product-neutral')
}
