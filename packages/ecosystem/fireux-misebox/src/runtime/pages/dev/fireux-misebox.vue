<template>
  <UPage>
    <UPageHeader
      title="Dev · Misebox"
      description="Model shapes for Chefs and Suppliers."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Chefs · Model'"
          :model="chefModelRuntime"
        />
      </UCard>

      <UCard>
        <DevModel
          :title="'Suppliers · Model'"
          :model="supplierModelRuntime"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { ChefCore as ChefCoreRuntime } from '../../models/profiles/Chef/Chef.model'
import { SupplierCore as SupplierCoreRuntime } from '../../models/profiles/Supplier/Supplier.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-tenant-misebox',
    label: 'Misebox',
    icon: 'i-lucide-utensils-crossed',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

const chefModelRuntime = ChefCoreRuntime as unknown as Record<string, unknown>
const supplierModelRuntime = SupplierCoreRuntime as unknown as Record<string, unknown>
</script>
