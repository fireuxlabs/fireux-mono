<template>
  <header class="product-hero">
    <div>
      <p class="product-kicker">{{ display(product?.tagline) }}</p>
      <h1 class="product-title">{{ display(product?.name) }}</h1>
      <p class="product-summary">{{ display(product?.description) }}</p>
    </div>
    <div class="product-price">
      <span class="price-label">{{ priceLabel(defaultPrice) }}</span>
      <span class="price-value">{{
        formatDefaultPrice(defaultPrice) || 'Custom'
      }}</span>
    </div>
  </header>
</template>
<script setup lang="ts">
import type { Product, ProductPrice } from '../../utils/product'
import {
  display,
  formatDefaultPrice,
  priceLabel,
} from '../../utils/product-display'
defineProps<{
  product?: Partial<Product>
  defaultPrice?: Partial<ProductPrice> | null
}>()
</script>
<style scoped>
.product-hero {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 8);
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--ui-border);
}

.product-kicker {
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}

.product-title {
  font-size: var(--text-3xl);
  margin: var(--spacing) 0 calc(var(--spacing) * 2);
}

.product-summary {
  max-width: 36rem;
  color: var(--ui-text-toned);
}

.product-price {
  min-width: 14rem;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 1.5);
  background: var(--ui-bg-elevated);
  text-align: left;
}

.price-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}

.price-value {
  display: block;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing) 0;
}
</style>
