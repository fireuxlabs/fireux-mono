<template>
  <section>
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
      <UPageGrid as="div">
        <UCard>
          <div class="card__header">
            <div>
              <p>Gross sales</p>
              <p>
                {{ formatMoney(grossSalesMinor) }}
              </p>
              <p>{{ periodLabel }}</p>
            </div>
            <span>
              <UIcon name="i-lucide-trending-up" />
            </span>
          </div>
        </UCard>

        <UCard v-for="metric in supportingMetrics" :key="metric.label">
          <div class="card__header">
            <p>{{ metric.label }}</p>
            <UIcon :name="metric.icon" />
          </div>
          <p>
            {{ metric.value }}
          </p>
          <p>{{ metric.description }}</p>
        </UCard>
      </UPageGrid>

      <UAlert
        color="primary"
        variant="subtle"
        icon="i-lucide-sparkles"
        title="Financial insight"
        :description="insight"
      />

      <UPageGrid as="div">
        <UCard>
          <FinanceReportTrend
            v-if="salesTrend.points.length > 1"
            :trend="salesTrend"
            size="lg"
          />
          <div v-else>
            More than one reporting point is needed to show a trend.
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <h2>Management picture</h2>
              <p>What the connected sources can prove.</p>
            </div>
          </template>
          <dl>
            <div v-for="item in managementPicture" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </UCard>
      </UPageGrid>

      <UPageGrid as="div">
        <UCard>
          <template #header><h2>Sales by service</h2></template>
          <ul>
            <li v-for="service in serviceBreakdown" :key="service.type">
              <div>
                <p>
                  {{ formatTransactionType(service.type) }}
                </p>
                <p>{{ formatCount(service.checks) }} completed</p>
              </div>
              <p>
                {{ formatMoney(service.amountMinor) }}
              </p>
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header><h2>Best sellers</h2></template>
          <ul>
            <li
              v-for="item in bestSellers"
              :key="`${item.source_item_id}:${item.variant_id ?? ''}`"
            >
              <div>
                <p class="fx-truncate">
                  {{ item.label }}
                </p>
                <p>{{ formatCount(item.quantity) }} sold</p>
              </div>
              <p>
                {{ formatMoney(item.line_gross.amount_minor) }}
              </p>
            </li>
          </ul>
        </UCard>
      </UPageGrid>
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
