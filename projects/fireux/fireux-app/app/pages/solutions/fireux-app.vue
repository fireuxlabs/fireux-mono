<template>
  <UPage>
    <UPageHeader
      title="FireUX App"
      description="Hosted and maintained by FireUX."
    />

    <UPageBody>
      <ProductViewProduct
        v-if="product"
        mode="fetch"
        variant="page"
        :product="product"
      />
      <UAlert
        v-else
        color="amber"
        title="Product not found"
        description="The FireUX App product record is missing."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import ProductViewProduct from 'fireux-products/runtime/components/organisms/entities/Product/View/Product.vue'
import { useProducts } from 'fireux-products/runtime/composables/fireux/firestore/objects/product/useProducts'

definePageMeta({
  layout: 'default',
  title: 'FireUX App',
  name: 'SolutionsFireuxAppPage',
})

const { fetchProductBySlug, fetchProductPrices } = await useProducts()

const product = await fetchProductBySlug('fireux-app')
if (product?.id) {
  product.prices = await fetchProductPrices(product.id)
}
</script>
