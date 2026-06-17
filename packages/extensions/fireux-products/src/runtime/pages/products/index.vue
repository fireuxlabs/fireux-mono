<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/products/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <ProductCTA />
      <ProductCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
const pageDescription =
  'Canonical product index for the current runtime.'

definePageMeta({
  layout: 'default',
  title: 'Products',
  description: 'Canonical product index for the current runtime.',
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
