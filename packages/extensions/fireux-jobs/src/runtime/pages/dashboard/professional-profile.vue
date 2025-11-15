<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional-profile.vue -->
<template>
  <UPageCard v-if="coreProfile" variant="subtle">
    <div class="space-y-6">
      <OrganismsProfilesProfessionalEditCore :professional="coreProfile" />
      <OrganismsProfilesProfessionalEditApp
        v-if="isTenant"
        :professional="appProfile"
      />
    </div>
  </UPageCard>

  <UCard v-else>
    <p class="fallback">Professional profile not found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

declare function definePageMeta(meta: any): void

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-profile',
    label: 'Professional Profile',
    icon: 'i-lucide-user-round-cog',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useProfessional()
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
