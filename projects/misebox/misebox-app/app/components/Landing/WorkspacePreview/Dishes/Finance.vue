<template>
  <article
    class="min-h-[24rem] rounded-xl border border-default bg-default p-4 shadow-sm sm:p-5"
    aria-label="Dish Finance preview"
  >
    <p class="fx-type-caption">Finance</p>
    <h3 class="mt-1 fx-type-card-heading">{{ dish.name }}</h3>

    <dl v-if="dish.finance" class="mt-5 grid grid-cols-2 gap-3">
      <div
        class="col-span-2 flex items-center justify-between gap-3 rounded-lg bg-elevated/40 p-3"
      >
        <dt>Selling price</dt>
        <dd>{{ formatMoney(dish.finance.sellingPriceMinor) }}</dd>
      </div>
      <UCard>
        <dt>Quantity sold</dt>
        <dd class="mt-1">
          {{ dish.finance.quantitySold ?? 'No completed sales' }}
        </dd>
      </UCard>
      <UCard>
        <dt>Total sales</dt>
        <dd class="mt-1">
          {{
            dish.finance.totalSalesMinor === null
              ? '—'
              : formatMoney(dish.finance.totalSalesMinor)
          }}
        </dd>
      </UCard>
      <div class="rounded-lg bg-elevated/40 p-3">
        <dt>Cost of sales</dt>
        <dd class="mt-1">{{ formatMoney(dish.finance.costOfSalesMinor) }}</dd>
      </div>
      <div class="rounded-lg bg-elevated/40 p-3">
        <dt>Gross profit</dt>
        <dd class="mt-1">{{ formatMoney(dish.finance.grossProfitMinor) }}</dd>
      </div>
      <UCard>
        <dt>Food cost</dt>
        <dd class="mt-1">
          {{ formatPercentage(dish.finance.foodCostPercentage) }}
        </dd>
      </UCard>
      <UCard>
        <dt>Gross margin</dt>
        <dd class="mt-1">
          {{ formatPercentage(dish.finance.grossMarginPercentage) }}
        </dd>
      </UCard>
    </dl>
    <p v-else class="mt-5 rounded-lg bg-elevated/40 p-3 fx-type-caption">
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
