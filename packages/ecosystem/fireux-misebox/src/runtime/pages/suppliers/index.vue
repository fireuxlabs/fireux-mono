<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsProfilesSupplierCTA />
      <OrganismsProfilesSupplierCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

definePageMeta({
  nav: {
    key: 'suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Suppliers',
  description: 'Supplier profiles resolved for this runtime.',
  layout: 'default',
  name: 'SuppliersIndexPage',
})

const pageTitle = 'Suppliers'
const pageDescription =
  'Inspect your supplier profile and browse suppliers resolved for this runtime.'

useHead({ title: pageTitle })
</script>
