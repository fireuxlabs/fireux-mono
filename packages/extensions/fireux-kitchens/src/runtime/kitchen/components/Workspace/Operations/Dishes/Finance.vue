<template>
  <UCard v-if="pending">
    <USkeleton class="h-28" />
  </UCard>

  <UAlert
    v-else-if="error"
    color="error"
    variant="soft"
    icon="i-lucide-circle-alert"
    title="Dish finance unavailable"
    description="Supplier prices could not be loaded for this estimate."
  />

  <UCard v-else-if="finance">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-primary">
            Dish finance
          </p>
          <h2 class="mt-1 text-base font-semibold text-highlighted">
            Cost of sales
          </h2>
        </div>
        <UBadge color="warning" variant="soft"> Planning estimate </UBadge>
      </div>
    </template>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg border border-default bg-elevated/30 p-3">
        <p class="text-xs text-muted">{{ finance.sellingPriceLabel }}</p>
        <p class="mt-1 text-xl font-semibold text-highlighted">
          {{ formatMoney(finance.sellingPriceMinor) }}
        </p>
      </div>
      <div class="rounded-lg border border-default bg-elevated/30 p-3">
        <p class="text-xs text-muted">
          {{ finance.complete ? 'Cost of sales' : 'Known ingredient cost' }}
        </p>
        <p class="mt-1 text-xl font-semibold text-highlighted">
          {{ formatMoney(finance.costOfSalesMinor) }}
        </p>
      </div>
      <div class="rounded-lg border border-default bg-elevated/30 p-3">
        <p class="text-xs text-muted">Gross profit</p>
        <p class="mt-1 text-xl font-semibold text-highlighted">
          {{ formatMoney(finance.grossProfitMinor) }}
        </p>
      </div>
      <div class="rounded-lg border border-default bg-elevated/30 p-3">
        <p class="text-xs text-muted">Food cost · Gross margin</p>
        <p class="mt-1 text-xl font-semibold text-highlighted">
          {{ formatPercent(finance.foodCostPercentage) }}
          <span class="text-sm font-medium text-muted">
            · {{ formatPercent(finance.grossMarginPercentage) }}
          </span>
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenDishFinanceEstimate } from '../../../../composables/workspace/operations/Dishes/useKitchenWorkspaceDishFinance'

const props = defineProps<{
  finance: KitchenDishFinanceEstimate | null
  pending: boolean
  error?: unknown
}>()

const moneyFormatter = computed(
  () =>
    new Intl.NumberFormat('en-CH', {
      style: 'currency',
      currency: props.finance?.currencyCode || 'CHF',
      minimumFractionDigits: props.finance?.minorUnitDigits ?? 2,
      maximumFractionDigits: props.finance?.minorUnitDigits ?? 2,
    })
)
const minorFactor = computed(() => 10 ** (props.finance?.minorUnitDigits ?? 2))

const formatMoney = (minor: number | null) =>
  minor === null ? '—' : moneyFormatter.value.format(minor / minorFactor.value)
const formatPercent = (value: number | null) =>
  value === null
    ? '—'
    : `${new Intl.NumberFormat('en-CH', {
        maximumFractionDigits: 1,
      }).format(value)}%`
</script>
