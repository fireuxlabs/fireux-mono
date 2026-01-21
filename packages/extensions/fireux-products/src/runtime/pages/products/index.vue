<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/index.vue -->
<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <ProductCTA />
      <ProductCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useProductCollection } from '../../composables/fireux/firestore/objects/product/fetch/useProductCollection'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
const pageDescription = 'Products catalog.'

definePageMeta({
  layout: 'default',
  title: 'Products',
  description: 'Products catalog.',
  nav: {
    key: 'products',
    label: 'Products',
    icon: 'i-lucide-box',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'ProductsIndexPage',
})

useHead({ title: `${appName} | ${pageTitle}` })

const { products } = useProductCollection()
const collection = computed(() => products.value ?? [])
</script>

