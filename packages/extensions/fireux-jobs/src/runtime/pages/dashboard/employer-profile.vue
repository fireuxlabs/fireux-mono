<!-- packages/extensions/fireux-jobs/src/runtime/pages/dashboard/employer-profile.vue -->
<template>
  <UPageCard v-if="coreProfile" variant="subtle">
    <div class="space-y-6">
      <OrganismsProfilesEmployerEditCore :employer="coreProfile" />
      <OrganismsProfilesEmployerEditApp
        v-if="isTenant"
        :employer="appProfile"
      />
    </div>
  </UPageCard>

  <UCard v-else>
    <p class="fallback">Employer profile not found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

declare function definePageMeta(meta: any): void

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-employer-profile',
    label: 'Employer Profile',
    icon: 'i-lucide-briefcase-business',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'employer',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useEmployer()
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
