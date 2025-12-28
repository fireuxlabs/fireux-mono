<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/index.vue -->
<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/index.vue -->
<template>
  <UPage>
    <UPageHeader title="Products" description="Products catalog." />
    <UPageBody class="pagebody">
      <OrganismsProductCTA v-if="showCTA" />
      <OrganismsProductCardsList :products="products ?? []" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useProducts } from '../../composables/fireux/firestore/objects/product/useProducts'
import { useProductPermissions } from '../../composables/useProductPermissions'

const { appName } = useFireUXConfig()

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
  head: { title: 'Products' },
})

useHead({ title: `${appName} | Products` })

const { productsCollection: products } = await useProducts()
const { canPublishProduct: showCTA } = useProductPermissions()
</script>
