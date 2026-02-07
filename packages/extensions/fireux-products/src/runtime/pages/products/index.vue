<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <ProductsSolutions />
      <ProductCollectionManager :collection="collection" />
      <DevJson
        v-if="isDev"
        :title="'Products (JSON)'"
        context="products index · products list"
        :data="collection"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useProductFetch } from '../../composables/fireux/firestore/objects/product/fetch/useProductFetch'
import ProductsSolutions from '../../components/organisms/entities/Product/Solutions.vue'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
const pageDescription =
  'Create a product and browse all products available to this runtime.'

definePageMeta({
  layout: 'default',
  title: 'Products',
  description: 'Create and browse products for this runtime.',
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

const { products } = useProductFetch()
const collection = computed(() => products.value ?? [])
const isDev = import.meta.dev
</script>
