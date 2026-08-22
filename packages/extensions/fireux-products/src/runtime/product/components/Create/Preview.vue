<template>
  <div class="preview-layout">
    <h1>Cell</h1>
    <ProductViewProduct
      mode="preview"
      variant="cell"
      :product="previewProduct"
      :prices="prices"
      :default-price="defaultPrice"
    />
    <h1>Customer</h1>
    <ProductViewProduct
      mode="preview"
      variant="customer"
      :product="previewProduct"
      :prices="prices"
      :default-price="defaultPrice"
    />
    <h1>Info</h1>
    <ProductViewProduct
      mode="preview"
      variant="info"
      :product="previewProduct"
      :prices="prices"
      :default-price="defaultPrice"
    />
    <h1>Page</h1>
    <ProductViewProduct
      mode="preview"
      variant="page"
      :product="previewProduct"
      :prices="prices"
      :default-price="defaultPrice"
    />
  </div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import { useCreatePricesState } from '../../composables/create/useCreatePricesState'
import { useCreateProductState } from '../../composables/create/useCreateProductState'
import type { FirebaseProduct } from '../../models/product.model.ts'

const { product } = await useCreateProductState()
const { prices, defaultPrice } = useCreatePricesState()

// Fix: Use the same key that ImagePicker uses (with "Data" suffix)
const mainImageData = useStorage('createProductMainImageData', '')

const previewProduct = computed(
  () =>
    ({
      ...product.value,
      // Use main_image field from FirebaseProduct model
      main_image: mainImageData.value || '/img/placeholder-product.png',
    } as Partial<FirebaseProduct>)
)
</script>

<style scoped>
.preview-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: calc(var(--spacing) * 6);
}
</style>
