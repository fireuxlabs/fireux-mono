packages/tenants/fireux-misebox/src/runtime/pages/dashboard/supplier-profile.vue
<template>
  <DashboardEditStructure
    title="Supplier Profile"
    description="Share your supplier details with the Misebox marketplace."
  >
    <OrganismsProfileRoot :config="supplierConfig">
      <template #current-assets="{ profile }">
        <div v-if="profile">
          <MiseProfilesSupplierEdit :supplier="profile" />
        </div>
      </template>

      <template #item></template>
    </OrganismsProfileRoot>
  </DashboardEditStructure>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import DashboardEditStructure from 'fireux-core/runtime/components/layouts/dashboard/EditStructure.vue'
import { supplierConfig } from '../../models/profiles/Supplier.model'
import MiseProfilesSupplierEdit from '../../components/organisms/profiles/Supplier/Edit.vue'
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-supplier-profile',
    label: 'Supplier Profile',
    icon: 'i-lucide-package',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'supplier',
  },
  requiresAuth: true,
})
</script>
