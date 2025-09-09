<template>
  <div class="product-metrics">
    <UCard>
      <template #default>
        <h3>Total Products</h3>
        <div>
          <p>{{ totalProducts }}</p>
        </div>
      </template>
    </UCard>
    <UCard>
      <template #default>
        <h3>Active Products</h3>
        <div>
          <p>{{ activeProducts }}</p>
        </div>
      </template>
    </UCard>
    <UCard>
      <template #default>
        <h3>Out of Stock Products</h3>
        <div>
          <p>{{ outOfStockProducts }}</p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { totalProducts, activeProducts, outOfStockProducts } = await useProductMetrics()
</script>

<style scoped>
.product-metrics {
  display: grid;
  gap: 1rem;
}
</style>