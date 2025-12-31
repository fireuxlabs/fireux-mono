<template>
  <div class="product-list">
    <template v-if="products.length">
      <OrganismsObjectsProductViewProduct
        v-for="product in products"
        :key="product.slug"
        :product="product"
        mode="fetch"
        variant="cell"
      />
    </template>
    <p v-else>No products found.</p>
  </div>
</template>

<script setup lang="ts">
import type { FirebaseProduct } from '../../../../../models/objects/product.model'

defineProps<{ products: FirebaseProduct[] }>()
</script>

<style scoped>
.product-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
