<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create Supplier Profile"
      description="Create your supplier profile once, then enter the same supplier console from anywhere."
    />

    <UPageBody class="pagebody">
      <SupplierCreateSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import SupplierCreateSystem from '../../components/console/supplier/Create/System.vue'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Create Supplier Profile',
  description: 'Create a supplier profile.',
  nav: {
    key: 'suppliers-create',
    label: 'Create supplier profile',
    icon: 'i-lucide-plus',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'SuppliersCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Create Supplier Profile` })
</script>
