<!-- packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue -->
<template>
  <UPageCard v-if="coreProfile" variant="subtle">
    <div class="space-y-6">
      <OrganismsProfilesChefEditCore :chef="coreProfile" />
      <OrganismsProfilesChefEditApp v-if="isTenant" :chef="appProfile" />
    </div>
  </UPageCard>

  <UCard v-else>
    <p class="fallback">Chef profile not found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { useChef } from '../../composables/firestore/profiles/Chef/useChef'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

declare function definePageMeta(meta: any): void

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-chef-profile',
    label: 'Chef Profile',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'chef',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useChef()
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
