<template>
  <CollectionPage
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-box"
    secondary-label="Product tools"
  >
    <MoleculesStateCard
      v-if="productCollection.outcome === 'pending'"
      entity="Product"
      kind="collection"
      loading
    />
    <MoleculesStateCard
      v-else-if="productCollection.outcome === 'error'"
      entity="Product"
      kind="collection"
      state="error"
    />
    <ProductCollection v-else :products="productCollection.products" />

    <template #secondary>
      <ProductCTA />
    </template>
  </CollectionPage>
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
