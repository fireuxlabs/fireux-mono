<!-- FILE: packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />

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
import { useSupplierFetch } from '../../composables/fireux/firestore/supplier/fetch/useSupplierFetch'

definePageMeta({
  tag: 'suppliers',
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
  description: 'Browse supplier records.',
  layout: 'default',
  name: 'SuppliersIndexPage',
})

const pageTitle = 'Suppliers'
const pageDescription =
  'Choose a supplier surface for this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { coreSuppliers } = useSupplierFetch()
const collection = computed(() => coreSuppliers.value ?? [])

</script>
