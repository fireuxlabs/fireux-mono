<!-- packages/tenants/fireux-misebox/src/runtime/pages/dashboard/supplier-profile.vue -->
<template>
  <UPageCard v-if="hasSupplierProfile" variant="subtle">

    <div v-if="coreProfile" class="space-y-6">
      <OrganismsProfilesSupplierEditCore :supplier="coreProfile" />
      <OrganismsProfilesSupplierEditApp
        v-if="isTenant"
        :supplier="appProfile"
      />
    </div>

    <div v-else class="fallback loading">Supplier profile data is loading.</div>
  </UPageCard>

  <UCard v-else>
    <p class="fallback">Supplier profile not found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

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

const { user } = useUser()
const hasSupplierProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes('supplier')
})
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}

.loading {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
