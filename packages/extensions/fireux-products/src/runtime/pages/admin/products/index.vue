<!-- FILE: packages/extensions/fireux-products/src/runtime/pages/admin/products/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription">
      <template #actions>
        <UButton to="/admin/products/create" color="primary">
          Create product
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <ProductCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useProductCollection } from '../../../composables/fireux/firestore/product/fetch/useProductCollection'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
const pageDescription = 'Manage products for this runtime.'

definePageMeta({
  layout: 'console',
  title: 'Admin Products',
  adminSurface: {
    surface: true,
    key: 'products',
    label: 'Products',
    description: 'Manage public products, pricing, and product pages.',
    icon: 'i-lucide-package',
    order: 10,
    createTo: '/admin/products/create',
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: `${appName} | ${pageTitle}` })

const { products } = useProductCollection()
const collection = computed(() => products.value ?? [])
</script>
