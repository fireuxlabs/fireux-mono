<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <FireState
        :outcome="productCollection.outcome"
        entity="products"
        :error="productCollection.error"
      />
      <ProductCollection
        v-if="productCollection.outcome === 'ready'"
        :products="productCollection.products"
      />
      <ProductDirectoryActions />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useProductCollection } from '../../product/composables/useProductCollection'
const productCollection = reactive(useProductCollection())

import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
const pageDescription =
  'Browse products, modules, and add-ons available for this app.'

definePageMeta({
  layout: 'default',
  title: 'Products',
  description: 'Browse products, modules, and add-ons.',
  nav: {
    key: 'products',
    label: 'Products',
    icon: 'i-lucide-box',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  name: 'ProductsIndexPage',
})

useHead({ title: `${appName} | ${pageTitle}` })
</script>
