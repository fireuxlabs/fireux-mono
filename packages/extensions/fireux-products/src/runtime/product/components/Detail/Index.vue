<template>
  <div class="product-page">
    <ProductDetailHeader :product="product" :default-price="defaultPrice" />

    <section v-if="product?.content" class="product-section">
      <h2>Overview</h2>
      <div v-html="product.content" />
    </section>

    <div class="purchase-buttons">
      <ProductCheckoutAction
        :product="product"
        :default-price="defaultPrice"
        :preview="preview"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Product, ProductPrice } from '../../utils/product'

defineProps<{
  product?: Partial<Product>
  defaultPrice?: Partial<ProductPrice> | null
  preview?: boolean
}>()
</script>
<style scoped>
.purchase-buttons {
  margin-top: calc(var(--spacing) * 4);
  display: flex;
  gap: calc(var(--spacing) * 3);
}

.product-page {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 8);
}

.product-section h2 {
  margin: 0 0 calc(var(--spacing) * 3);
  font-size: var(--text-lg);
}
</style>
