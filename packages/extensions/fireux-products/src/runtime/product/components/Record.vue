<template>
  <ul>
    <li v-if="product?.id"><strong>ID:</strong> {{ product.id }}</li>
    <li><strong>Name:</strong> {{ display(product?.name) }}</li>
    <li><strong>Slug:</strong> {{ display(product?.slug) }}</li>
    <li>
      <strong>Created:</strong> {{ displayTimestamp(product?.created?.at) }}
    </li>
    <li>
      <strong>Updated:</strong> {{ displayTimestamp(product?.updated?.at) }}
    </li>
    <li><strong>Source App:</strong> {{ display(product?.source_app_id) }}</li>
    <li><strong>Visibility:</strong> {{ display(product?.visibility) }}</li>
    <li>
      <strong>Image Supplied:</strong>
      {{ product?.main_image ? 'Yes' : 'No' }}
    </li>
    <li><strong>Type:</strong> {{ display(product?.product_type) }}</li>
    <li><strong>Content:</strong> {{ display(product?.content) }}</li>
    <li>
      <strong>Default Price:</strong>
      <span
        :class="{
          'text-error': defaultPrice?.unit_amount == null,
        }"
        >{{ defaultPrice?.unit_amount ?? '!' }}</span
      >
    </li>
  </ul>
</template>
<script setup lang="ts">
import type { Product, ProductPrice } from '../utils/product'
import { display, displayTimestamp } from '../utils/product-display'
defineProps<{
  product?: Partial<Product>
  defaultPrice?: Partial<ProductPrice> | null
  preview?: boolean
}>()
</script>
