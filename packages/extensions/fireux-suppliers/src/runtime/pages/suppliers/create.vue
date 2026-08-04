<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create your Supplier Console"
      description="Create one Supplier identity, its Misebox access, and your first Console target together."
    />

    <UPageBody class="pagebody">
      <SupplierCreateSystem
        mode="console"
        return-to="/console/supplier"
        cancel-to="/suppliers"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Create Supplier Console',
  description: 'Create a Supplier identity and Console access together.',
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
useHead({ title: `${appName} | Create Supplier Console` })
</script>
