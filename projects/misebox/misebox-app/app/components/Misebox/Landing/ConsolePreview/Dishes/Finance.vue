<template>
  <article
    class="min-h-[24rem] rounded-xl border border-default bg-default p-4 shadow-sm sm:p-5"
    aria-label="Dish Finance preview"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-primary">Finance</p>
    <h3 class="mt-1 text-lg font-semibold text-highlighted">{{ dish.name }}</h3>

    <dl v-if="dish.finance" class="mt-5 grid grid-cols-2 gap-3">
      <div class="col-span-2 flex items-center justify-between gap-3 rounded-lg bg-elevated/40 p-3">
        <dt class="text-sm text-muted">Selling price</dt>
        <dd class="font-semibold text-highlighted">{{ formatMoney(dish.finance.sellingPriceMinor) }}</dd>
      </div>
      <div class="rounded-lg bg-elevated/40 p-3">
        <dt class="text-xs text-muted">Cost of sales</dt>
        <dd class="mt-1 font-semibold text-highlighted">{{ formatMoney(dish.finance.costOfSalesMinor) }}</dd>
      </div>
      <div class="rounded-lg bg-elevated/40 p-3 text-right">
        <dt class="text-xs text-muted">Gross profit</dt>
        <dd class="mt-1 font-semibold text-highlighted">{{ formatMoney(dish.finance.grossProfitMinor) }}</dd>
      </div>
      <div class="rounded-lg border border-default p-3">
        <dt class="text-xs text-muted">Food cost</dt>
        <dd class="mt-1 text-lg font-semibold text-highlighted">{{ formatPercentage(dish.finance.foodCostPercentage) }}</dd>
      </div>
      <div class="rounded-lg border border-default p-3 text-right">
        <dt class="text-xs text-muted">Gross margin</dt>
        <dd class="mt-1 text-lg font-semibold text-highlighted">{{ formatPercentage(dish.finance.grossMarginPercentage) }}</dd>
      </div>
    </dl>
    <p v-else class="mt-5 rounded-lg bg-elevated/40 p-3 text-sm text-muted">
      Finance estimate unavailable.
    </p>
  </article>
</template>

<script setup lang="ts">
import type { ProductDemoDish } from './types'

const props = defineProps<{
  dish: ProductDemoDish
}>()

const formatMoney = (amountMinor: number | null) => {
  if (amountMinor === null || !props.dish.finance) return 'Not priced'
  return new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency: props.dish.finance.currencyCode,
    minimumFractionDigits: props.dish.finance.minorUnitDigits,
    maximumFractionDigits: props.dish.finance.minorUnitDigits,
  }).format(amountMinor / 10 ** props.dish.finance.minorUnitDigits)
}

const formatPercentage = (value: number | null) =>
  value === null ? '—' : `${value.toFixed(1)}%`
</script>
