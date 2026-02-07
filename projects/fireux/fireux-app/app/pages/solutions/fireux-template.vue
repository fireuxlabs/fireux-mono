<template>
  <UPage>
    <UPageHeader
      title="FireUX Template"
      description="Self-hosted starter built on FireUX canon."
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
        description="The FireUX Template product record is missing."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import ProductViewProduct from 'fireux-products/runtime/components/organisms/entities/Product/View/Product.vue'
import { useProducts } from 'fireux-products/runtime/composables/fireux/firestore/objects/product/useProducts'

definePageMeta({
  layout: 'default',
  title: 'FireUX Template',
  name: 'SolutionsFireuxTemplatePage',
})

const { fetchProductBySlug, fetchProductPrices } = await useProducts()

const product = await fetchProductBySlug('fireux-template')
if (product?.id) {
  product.prices = await fetchProductPrices(product.id)
}
</script>
