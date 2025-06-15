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
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import { useCreateProductState } from '../../../../composables/firestore/objects/Product/useCreateProductState'
import { useCreatePricesState } from '../../../../composables/firestore/objects/Product/Prices/useCreatePricesState'
import type { FirebaseProduct } from '../../../../models/product.model'

const { product } = await useCreateProductState()
const { prices, defaultPrice } = useCreatePricesState()

const mainImageData = useStorage('createProductMainImage', '')

const previewProduct = computed(
  () =>
    ({
      ...product.value,
      prices: prices.value,
      main_image: mainImageData.value,
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
