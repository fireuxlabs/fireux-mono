<!-- FILE: packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader class="border-b-0" :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <SupplierCTA />
      <SupplierCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useSupplierFetch } from '../../composables/supplier/useSupplierFetch'

definePageMeta({
  keyEntitiesTag: 'suppliers',
  nav: {
    key: 'suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    order: 50,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Suppliers',
  description: 'Browse supplier profiles.',
  layout: 'default',
  name: 'SuppliersIndexPage',
})

const pageTitle = 'Suppliers'
const pageDescription =
  'View your profile and browse suppliers.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { coreSuppliers, appSuppliers } = useSupplierFetch()
const collection = computed(() => [
  ...(appSuppliers?.value ?? []),
  ...(coreSuppliers.value ?? []),
])

</script>
