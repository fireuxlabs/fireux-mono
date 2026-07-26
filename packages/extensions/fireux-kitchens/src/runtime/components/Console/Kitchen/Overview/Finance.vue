<!-- Concurrent edit — 2026-07-21 17:08 CEST — Kitchen Finance surface: render the first derived Kitchen gross-sales report. -->
<template>
  <section class="console-surface">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="option in periodOptions"
          :key="option.value"
          color="neutral"
          :variant="selectedPeriod === option.value ? 'solid' : 'soft'"
          size="sm"
          @click="selectedPeriod = option.value"
        >
          {{ option.label }}
        </UButton>
      </div>

      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="soft"
        :loading="pending"
        :disabled="!canLoad"
        @click="refresh"
      >
        Refresh
      </UButton>
    </div>

    <UAlert
      v-if="isTest || (isDemo && !pending && !report)"
      color="neutral"
      variant="soft"
      icon="i-lucide-database"
      title="No sales available"
      description="The selected Kitchen does not have sales for this view."
    />

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Finance report unavailable"
      :description="error"
    />

    <div v-if="pending" class="grid gap-4 md:grid-cols-3">
      <USkeleton v-for="index in 3" :key="index" class="h-32" />
    </div>

    <UAlert
      v-else-if="report && report.sale_count === 0"
      color="neutral"
      variant="soft"
      icon="i-lucide-receipt-text"
      title="No completed sales in this period"
      description="New sales appear here when priced Orders reach Completed. Earlier Orders are not guessed or backfilled."
    />

    <div v-else-if="report" class="space-y-4">
      <div
        v-for="summary in report.currencies"
        :key="summary.currency_code"
        class="space-y-3"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm font-semibold text-highlighted">
            {{ summary.currency_code }}
          </div>
          <div class="text-xs text-dimmed">
            {{ formatPeriod(report.period.from, report.period.to) }}
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <UCard>
            <div class="text-sm text-toned">Gross sales</div>
            <div class="mt-2 text-2xl font-semibold text-highlighted">
              {{ formatMoney(summary.gross_sales) }}
            </div>
          </UCard>

          <UCard>
            <div class="text-sm text-toned">Completed sales</div>
            <div class="mt-2 text-2xl font-semibold text-highlighted">
              {{ summary.sale_count.toLocaleString() }}
            </div>
          </UCard>

          <UCard>
            <div class="text-sm text-toned">Average sale</div>
            <div class="mt-2 text-2xl font-semibold text-highlighted">
              {{ formatMoney(summary.average_sale) }}
            </div>
          </UCard>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model.ts'
import { useKitchenConsoleFinance } from '../../../../composables/fireux/console/kitchen/overview/useKitchenConsoleFinance'

const {
  selectedPeriod,
  periodOptions,
  report,
  pending,
  error,
  isLive,
  isDemo,
  isTest,
  canLoad,
  refresh,
} = useKitchenConsoleFinance()

function formatMoney(money: FinancialMoney) {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: money.currency_code,
  })
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  return formatter.format(money.amount_minor / 10 ** digits)
}

function formatPeriod(from: string, to: string) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  })
  return `${formatter.format(new Date(from))} – ${formatter.format(new Date(to))}`
}

</script>
