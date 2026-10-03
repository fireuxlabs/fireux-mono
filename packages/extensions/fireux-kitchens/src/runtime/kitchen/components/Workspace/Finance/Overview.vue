<template>
  <section class="space-y-5">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <UCard class="sm:col-span-2">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-muted">Gross sales</p>
            <p
              class="mt-3 text-4xl font-semibold tracking-tight tabular-nums text-highlighted sm:text-5xl"
            >
              {{ formatMoney(grossSalesMinor) }}
            </p>
            <p class="mt-3 text-sm text-muted">{{ periodLabel }}</p>
          </div>
          <span
            class="flex size-11 items-center justify-center rounded-xl bg-success/10 text-success"
          >
            <UIcon name="i-lucide-trending-up" class="size-5" />
          </span>
        </div>
      </UCard>

      <UCard v-for="metric in supportingMetrics" :key="metric.label">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-muted">{{ metric.label }}</p>
          <UIcon :name="metric.icon" class="size-4 text-dimmed" />
        </div>
        <p class="mt-4 text-2xl font-semibold tabular-nums text-highlighted">
          {{ metric.value }}
        </p>
        <p class="mt-2 text-xs text-muted">{{ metric.description }}</p>
      </UCard>
    </div>

    <UAlert
      color="primary"
      variant="subtle"
      icon="i-lucide-sparkles"
      title="Financial insight"
      :description="insight"
    />

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
      <UCard>
        <FinanceReportTrend
          v-if="salesTrend.points.length > 1"
          :trend="salesTrend"
          size="lg"
        />
        <div
          v-else
          class="flex min-h-64 items-center justify-center text-sm text-muted"
        >
          More than one reporting point is needed to show a trend.
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold text-highlighted">Management picture</h2>
            <p class="mt-1 text-xs text-muted">
              What the connected sources can prove.
            </p>
          </div>
        </template>
        <dl class="divide-y divide-default">
          <div
            v-for="item in managementPicture"
            :key="item.label"
            class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <dt class="text-sm text-muted">{{ item.label }}</dt>
            <dd class="text-right text-sm font-semibold text-highlighted">
              {{ item.value }}
            </dd>
          </div>
        </dl>
      </UCard>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header
          ><h2 class="font-semibold text-highlighted">
            Sales by service
          </h2></template
        >
        <ul class="divide-y divide-default">
          <li
            v-for="service in serviceBreakdown"
            :key="service.type"
            class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p class="text-sm font-medium text-highlighted">
                {{ formatTransactionType(service.type) }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ formatCount(service.checks) }} completed
              </p>
            </div>
            <p class="text-sm font-semibold tabular-nums text-highlighted">
              {{ formatMoney(service.amountMinor) }}
            </p>
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header
          ><h2 class="font-semibold text-highlighted">
            Best sellers
          </h2></template
        >
        <ul class="divide-y divide-default">
          <li
            v-for="item in bestSellers"
            :key="`${item.source_item_id}:${item.variant_id ?? ''}`"
            class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.label }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ formatCount(item.quantity) }} sold
              </p>
            </div>
            <p class="text-sm font-semibold tabular-nums text-highlighted">
              {{ formatMoney(item.line_gross.amount_minor) }}
            </p>
          </li>
        </ul>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenFinanceOverview } from '../../../composables/workspace/overview/useKitchenFinanceOverview'

const props = defineProps<{ fromDate: string; toDate: string }>()
const {
  periodLabel,
  grossSalesMinor,
  completedChecks,
  averageCheckMinor,
  itemsSold,
  salesTrend,
  serviceBreakdown,
  bestSellers,
  formatMoney,
  formatCount,
  formatTransactionType,
} = useKitchenFinanceOverview(props)

const supportingMetrics = computed(() => [
  {
    label: 'Average sale',
    value: formatMoney(averageCheckMinor.value),
    icon: 'i-lucide-calculator',
    description: 'Average completed transaction',
  },
  {
    label: 'Completed sales',
    value: formatCount(completedChecks.value),
    icon: 'i-lucide-receipt-text',
    description: `${formatCount(itemsSold.value)} items sold`,
  },
])
const insight = computed(() =>
  completedChecks.value
    ? `${formatCount(completedChecks.value)} completed sales generated ${formatMoney(grossSalesMinor.value)}. The average sale was ${formatMoney(averageCheckMinor.value)}.`
    : 'There are no completed sales in this period.'
)
const managementPicture = computed(() => [
  { label: 'Revenue evidence', value: 'Gross sales connected' },
  { label: 'Costs and margin', value: 'Not connected' },
  { label: 'Cash balance', value: 'Not connected' },
  { label: 'Budget and forecast', value: 'Not connected' },
])
</script>
