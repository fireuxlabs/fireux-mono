<!-- packages/tenants/fireux-misebox/src/runtime/pages/dashboard/supplier-profile.vue -->
<template>
  <UPageCard v-if="coreProfile" variant="subtle">
    <div class="space-y-6">
      <OrganismsProfilesSupplierEditCore :supplier="coreProfile" />
      <OrganismsProfilesSupplierEditApp
        v-if="isTenant"
        :supplier="appProfile"
      />
    </div>
  </UPageCard>

  <UCard v-else>
    <p class="fallback">Supplier profile not found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

declare function definePageMeta(meta: any): void

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

const { coreProfile, appProfile } = useSupplier()
const { role, appId } = useFireUXConfig()
const isTenant = role === 'tenant' && !!appId
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}
</style>
