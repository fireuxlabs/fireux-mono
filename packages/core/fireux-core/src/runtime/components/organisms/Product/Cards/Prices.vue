<template>
  <UCard class="prices-card" variant="outline">
    <template #header>
      <h3>Prices</h3>
    </template>
    <div v-if="!prices.length">No price available</div>
    <ul v-else class="price-list">
      <li
        v-for="(price, index) in prices"
        :key="price.id || index"
        :class="{ 'default-price': index === 0 }"
      >
        <span class="price-main">{{
          formatPrice(price.unit_amount, price.currency)
        }}</span>
        <span v-if="price.type === 'recurring'" class="recurring">
          ({{ price.interval_count || 1 }}×{{ price.interval || 'month' }})
        </span>
        <UBadge v-if="index === 0" color="primary" variant="soft"
          >Default</UBadge
        >
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{ productId: string }>()
const prices = ref<Price[]>([])
const { formatPrice, fetchProductPrices } = await useProducts()
if (props.productId) {
  prices.value = await fetchProductPrices(props.productId)
}
</script>

<style scoped>
.prices-card {
  font-size: 0.98rem;
}
.price-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.price-main {
  font-weight: 500;
}
.default-price {
  color: var(--primary, #facc15);
}
.recurring {
  color: var(--text-secondary, #888);
  margin-left: 0.5em;
}
</style>
