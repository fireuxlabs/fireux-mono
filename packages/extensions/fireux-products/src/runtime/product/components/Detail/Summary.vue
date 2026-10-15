<template>
  <p>
    <strong>{{ display(product?.name) }}</strong>
  </p>
  <p>{{ display(product?.description) }}</p>
  <p v-if="defaultPrice">{{ formatDefaultPrice(defaultPrice) }}</p>
  <div class="purchase-buttons">
    <ProductCheckoutAction
      :product="product"
      :default-price="defaultPrice"
      :preview="preview"
    />
  </div>
</template>
<script setup lang="ts">
import type { Product, ProductPrice } from '../../utils/product'
import { display, formatDefaultPrice } from '../../utils/product-display'
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
</style>
