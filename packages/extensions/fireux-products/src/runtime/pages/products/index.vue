<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <ProductSolutions />
      <ProductCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useProductFetch } from '../../composables/fireux/firestore/product/fetch/useProductFetch'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
const pageDescription =
  'Create and browse products available to this runtime.'

definePageMeta({
  layout: 'default',
  title: 'Products',
  description: pageDescription,
  nav: {
    key: 'products',
    label: 'Products',
    icon: 'i-lucide-box',
    order: 20,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'ProductsIndexPage',
})

useHead({ title: `${appName} | ${pageTitle}` })

const { products } = useProductFetch()
const collection = computed(() => products.value ?? [])
</script>
