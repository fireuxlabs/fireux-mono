<template>
  <UCard as="article" aria-label="Dish Finance preview">
    <p class="fx-type-caption">Finance</p>
    <h3 class="fx-type-card-heading">{{ dish.name }}</h3>

    <dl v-if="dish.finance">
      <div>
        <dt>Selling price</dt>
        <dd>{{ formatMoney(dish.finance.sellingPriceMinor) }}</dd>
      </div>
      <UCard>
        <dt>Quantity sold</dt>
        <dd>
          {{ dish.finance.quantitySold ?? 'No completed sales' }}
        </dd>
      </UCard>
      <UCard>
        <dt>Total sales</dt>
        <dd>
          {{
            dish.finance.totalSalesMinor === null
              ? '—'
              : formatMoney(dish.finance.totalSalesMinor)
          }}
        </dd>
      </UCard>
      <div>
        <dt>Cost of sales</dt>
        <dd>{{ formatMoney(dish.finance.costOfSalesMinor) }}</dd>
      </div>
      <div>
        <dt>Gross profit</dt>
        <dd>{{ formatMoney(dish.finance.grossProfitMinor) }}</dd>
      </div>
      <UCard>
        <dt>Food cost</dt>
        <dd>
          {{ formatPercentage(dish.finance.foodCostPercentage) }}
        </dd>
      </UCard>
      <UCard>
        <dt>Gross margin</dt>
        <dd>
          {{ formatPercentage(dish.finance.grossMarginPercentage) }}
        </dd>
      </UCard>
    </dl>
    <p v-else class="fx-type-caption">Finance estimate unavailable.</p>
  </UCard>
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
