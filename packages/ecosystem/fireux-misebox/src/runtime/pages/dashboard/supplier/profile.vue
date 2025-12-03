<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-supplier-profile">
    <template #header>
      <UDashboardNavbar title="Supplier Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="hasSupplierProfile">
        <OrganismsProfileEditProfile v-if="coreProfile">
          <template #core>
            <OrganismsProfilesSupplierEditCore :supplier="coreProfile" />
          </template>

          <template v-if="appProfile" #app>
            <OrganismsProfilesSupplierEditApp :supplier="appProfile" />
          </template>
        </OrganismsProfileEditProfile>

        <div v-else class="fallback loading">
          Supplier profile data is loading.
        </div>
      </div>

      <div v-else class="fallback">Supplier profile not found.</div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'
import { useSupplier } from '../../../composables/firestore/profiles/Supplier/useSupplier'
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
