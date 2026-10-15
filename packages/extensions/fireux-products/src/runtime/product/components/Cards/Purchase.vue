<template>
  <div class="product-cell">
    <div v-if="product?.main_image" class="cell-thumb">
      <img :src="product.main_image" alt="Product image" />
    </div>
    <div class="cell-text">
      <h3 class="cell-title">
        {{ display(product?.name) || 'Unnamed Product' }}
      </h3>
      <p class="cell-description">{{ display(product?.description) }}</p>
      <p v-if="defaultPrice" class="cell-price">
        {{ formatDefaultPrice(defaultPrice) }}
      </p>
      <div class="purchase-buttons">
        <ProductCheckoutAction
          :product="product"
          :default-price="defaultPrice"
          :preview="preview"
        />
      </div>
    </div>
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
.product-cell {
  display: flex;
  gap: calc(var(--spacing) * 4);
  align-items: flex-start;
  text-align: left;
}

.cell-thumb {
  width: 7rem;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--ui-radius);
  background: transparent;
}

.cell-thumb img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.cell-text {
  flex: 1;
}

.cell-title {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  text-align: left;
}

.cell-description {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  margin-top: var(--spacing);
}

.cell-price {
  margin-top: calc(var(--spacing) * 2);
  font-weight: var(--font-weight-bold);
}

.purchase-buttons {
  margin-top: calc(var(--spacing) * 4);
  display: flex;
  gap: calc(var(--spacing) * 3);
}
</style>
