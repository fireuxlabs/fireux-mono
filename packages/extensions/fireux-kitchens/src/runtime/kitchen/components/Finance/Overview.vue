<template>
  <section class="space-y-5">
    <p v-if="outcome === 'pending'" role="status">Loading sales…</p>
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Sales could not be loaded"
      :description="error"
    >
      <template #actions><FireCopyError :message="error" /></template>
    </UAlert>
    <p v-else-if="outcome !== 'ready' && outcome !== 'empty'">
      Select an available Kitchen to view sales.
    </p>
    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <UCard class="sm:col-span-2">
          <div class="card__header">
            <div>
              <p>Gross sales</p>
              <p class="mt-3 tabular-nums">
                {{ formatMoney(grossSalesMinor) }}
              </p>
              <p class="mt-3">{{ periodLabel }}</p>
            </div>
            <span
              class="flex size-11 items-center justify-center rounded-xl bg-success/10"
            >
              <UIcon name="i-lucide-trending-up" />
            </span>
          </div>
        </UCard>

        <UCard v-for="metric in supportingMetrics" :key="metric.label">
          <div class="card__header">
            <p>{{ metric.label }}</p>
            <UIcon :name="metric.icon" />
          </div>
          <p class="mt-4 tabular-nums">
            {{ metric.value }}
          </p>
          <p class="mt-2">{{ metric.description }}</p>
        </UCard>
      </div>

      <UAlert
        color="primary"
        variant="subtle"
        icon="i-lucide-sparkles"
        title="Financial insight"
        :description="insight"
      />

      <div
        class="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]"
      >
        <UCard>
          <FinanceReportTrend
            v-if="salesTrend.points.length > 1"
            :trend="salesTrend"
            size="lg"
          />
          <div v-else class="flex min-h-64 items-center justify-center">
            More than one reporting point is needed to show a trend.
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <h2>Management picture</h2>
              <p class="mt-1">What the connected sources can prove.</p>
            </div>
          </template>
          <dl class="divide-y divide-default">
            <div
              v-for="item in managementPicture"
              :key="item.label"
              class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <dt>{{ item.label }}</dt>
              <dd>
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </UCard>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <UCard>
          <template #header><h2>Sales by service</h2></template>
          <ul class="divide-y divide-default">
            <li
              v-for="service in serviceBreakdown"
              :key="service.type"
              class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p>
                  {{ formatTransactionType(service.type) }}
                </p>
                <p class="mt-1">{{ formatCount(service.checks) }} completed</p>
              </div>
              <p class="tabular-nums">
                {{ formatMoney(service.amountMinor) }}
              </p>
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header><h2>Best sellers</h2></template>
          <ul class="divide-y divide-default">
            <li
              v-for="item in bestSellers"
              :key="`${item.source_item_id}:${item.variant_id ?? ''}`"
              class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div class="min-w-0">
                <p class="truncate">
                  {{ item.label }}
                </p>
                <p class="mt-1">{{ formatCount(item.quantity) }} sold</p>
              </div>
              <p class="tabular-nums">
                {{ formatMoney(item.line_gross.amount_minor) }}
              </p>
            </li>
          </ul>
        </UCard>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceFinanceOverview } from '../../composables/workspace/finance/useKitchenWorkspaceFinanceOverview'

const props = defineProps<{ fromDate: string; toDate: string }>()
const {
  outcome,
  error,
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
} = useKitchenWorkspaceFinanceOverview(props)

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
