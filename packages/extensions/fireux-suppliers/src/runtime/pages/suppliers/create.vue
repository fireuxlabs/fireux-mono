<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create Supplier"
      description="Create the public supplier record. Console setup happens separately."
    />

    <UPageBody class="pagebody">
      <SupplierCreateSystem mode="public" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Create Supplier',
  description: 'Create the public supplier record.',
  nav: {
    key: 'suppliers-create',
    label: 'Create supplier',
    icon: 'i-lucide-plus',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'SuppliersCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Create Supplier` })
</script>
