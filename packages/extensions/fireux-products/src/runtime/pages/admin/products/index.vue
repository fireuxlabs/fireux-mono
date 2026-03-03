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
import { useProductFetch } from '../../../composables/fireux/firestore/product/fetch/useProductFetch'

const { appName } = useFireUXConfig()

const pageTitle = 'Products'
const pageDescription = 'Manage products for this runtime.'

definePageMeta({
  layout: 'console',
  title: 'Admin Products',
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: `${appName} | ${pageTitle}` })

const { products } = useProductFetch()
const collection = computed(() => products.value ?? [])
</script>
