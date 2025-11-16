<!-- FILE: packages/tenants/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Suppliers"
      description="Inspect your supplier profile and browse suppliers resolved for this runtime."
    />

    <UPageBody class="space-y-6">
      <MiseProfilesSupplierSectionsSingle
        :core-profile="coreProfile"
        :app-profile="appProfile"
        :pill="pill"
      />

      <MiseProfilesSupplierSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier.ts'

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

const { coreProfile, appProfile, pill } = useSupplier()

useHead({ title: 'Suppliers' })
</script>
