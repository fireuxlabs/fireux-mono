<template>
  <div class="landing-finance-report" aria-label="Kitchen Finance preview">
    <template v-if="selectedSummary">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2" aria-label="Finance period">
          <UButton
            v-for="period in finance.periods"
            :key="period.id"
            color="neutral"
            :variant="selectedPeriod === period.id ? 'solid' : 'soft'"
            size="sm"
            @click="selectedPeriod = period.id"
          >
            {{ period.label }}
          </UButton>
        </div>

        <span class="text-xs font-semibold text-muted">Deanos · Demo</span>
      </div>

      <KitchenFinanceSummary
        :average-sale-minor="selectedSummary.averageSaleMinor"
        compact
        :currency-code="selectedSummary.currencyCode"
        :gross-sales-minor="selectedSummary.grossSalesMinor"
        :period-label="selectedSummary.label"
        :sale-count="selectedSummary.saleCount"
      />
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="error ? 'Finance preview unavailable' : 'No sales available'"
      :description="error
        ? 'The Deanos aggregate report could not be loaded.'
        : 'This Kitchen does not have a Demo Finance report.'"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { KitchenFinanceReportPeriod } from 'fireux-kitchens/runtime/kitchen/models/finance-report.model'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoFinance = MiseboxProductDemo['workspace']['finance']

const props = defineProps<{
  error: boolean
  finance: ProductDemoFinance
}>()

const selectedPeriod = ref<KitchenFinanceReportPeriod>('30d')
const selectedSummary = computed(() =>
  props.finance.periods.find(period => period.id === selectedPeriod.value)
  || props.finance.periods[0]
  || null
)
</script>

<style scoped>
.landing-finance-report {
  min-width: 0;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--ui-bg);
  box-shadow: 0 2rem 5rem rgb(0 0 0 / 16%);
}

@media (min-width: 40rem) {
  .landing-finance-report {
    padding: calc(var(--spacing) * 6);
  }
}
</style>
