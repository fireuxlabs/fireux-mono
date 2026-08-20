<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create your Supplier Workspace"
      description="Create one Supplier identity, its Misebox access, and your first Workspace target together."
    />

    <UPageBody class="pagebody">
      <SupplierCreateSystem
        mode="workspace"
        return-to="/workspace/supplier"
        cancel-to="/suppliers"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Create Supplier Workspace',
  description: 'Create a Supplier identity and Workspace access together.',
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
useHead({ title: `${appName} | Create Supplier Workspace` })
</script>
