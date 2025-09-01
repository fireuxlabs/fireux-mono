<template>
  <div class="preview-layout">
    <h1>Cell</h1>
    <FireOrganismsProductCardsProduct
      mode="preview"
      variant="cell"
      :product="previewProduct"
    />
    <h1>Customer</h1>
    <FireOrganismsProductCardsProduct
      mode="preview"
      variant="customer"
      :product="previewProduct"
    />
    <h1>Info</h1>
    <FireOrganismsProductCardsProduct
      mode="preview"
      variant="info"
      :product="previewProduct"
    />
    <h1>Page</h1>
    <FireOrganismsProductCardsProduct
      mode="preview"
      variant="page"
      :product="previewProduct"
    />
  </div>
  <pre>product  {{ product }}</pre>
  <pre>prices  {{ prices }}</pre>
  <pre>defaultPrice  {{ defaultPrice }}</pre>
  <pre>mainImageData length: {{ mainImageData?.length || 0 }}</pre>
  <pre>previewProduct {{ previewProduct }}</pre>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import { useCreateProductState } from '../../../../composables/firestore/objects/Product/useCreateProductState'
import { useCreatePricesState } from '../../../../composables/firestore/objects/Product/Prices/useCreatePricesState'
import type { FirebaseProduct } from '../../../../models'

const { product } = await useCreateProductState()
const { prices, defaultPrice } = useCreatePricesState()

// Fix: Use the same key that ImagePicker uses (with "Data" suffix)
const mainImageData = useStorage('createProductMainImageData', '')

const previewProduct = computed(
  () =>
    ({
      ...product.value,
      // Fix: Connect the prices from useCreatePricesState to the product
      prices: prices.value,
      // Use main_image field from FirebaseProduct model
      main_image: mainImageData.value || '/img/placeholder-product.png',
      default_price: defaultPrice.value,
    }) as Partial<FirebaseProduct>
)
</script>

<style scoped>
.preview-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}
</style>
