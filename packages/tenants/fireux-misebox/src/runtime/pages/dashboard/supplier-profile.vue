<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="supplierConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Supplier Profile</h2>
            <MiseProfilesSupplierEdit :supplier="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { supplierConfig } from '../../models/profiles/Supplier.model'
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
