<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <FireOrganismsProductCTA v-if="showCTA" />
      <FireOrganismsProductCardsList :products="products ?? []" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useProducts } from '../../composables/fireux/firestore/objects/Product/useProducts'
import { useProductPermissions } from '../../composables/useProductPermissions'

const { appName } = useFireUXConfig()
const pageTitle = 'Products'
const pageDescription = 'Products catalog.'

definePageMeta({
  layout: 'default',
  title: pageTitle,
  description: pageDescription,
  nav: {
    key: 'products',
    label: 'Products',
    icon: 'i-lucide-box',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  head: { title: pageTitle },
})

useHead({ title: `${appName} | ${pageTitle}` })

const { productsCollection: products } = await useProducts()
const { canManageProducts: showCTA } = useProductPermissions()
</script>
