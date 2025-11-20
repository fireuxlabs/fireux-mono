<!-- packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent-profile.vue -->
<template>
  <UPageCard v-if="coreProfile" variant="subtle">
    <div class="space-y-6">
      <OrganismsProfilesAgentEditCore :agent="coreProfile" />
      <OrganismsProfilesAgentEditApp
        v-if="isTenant"
        :agent="appProfile"
      />
    </div>
  </UPageCard>

  <UCard v-else>
    <p class="fallback">Agent profile not found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { useAgent } from '../../composables/firestore/profiles/Agent/useAgent'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

declare function definePageMeta(meta: any): void

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-agent-profile',
    label: 'Agent Profile',
    icon: 'i-lucide-briefcase-business',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useAgent()
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
