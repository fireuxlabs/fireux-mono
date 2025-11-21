<!-- packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent-profile.vue -->
<template>
  <UPageCard v-if="hasAgentProfile" variant="subtle">

    <div v-if="coreProfile" class="space-y-6">
      <OrganismsProfilesAgentEditCore :agent="coreProfile" />
      <OrganismsProfilesAgentEditApp v-if="isTenant" :agent="appProfile" />
    </div>

    <div v-else class="fallback loading">Agent profile data is loading.</div>
  </UPageCard>

  <UCard v-else>
    <p class="fallback">Agent profile not found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../composables/firestore/profiles/Agent/useAgent'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

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

const { user } = useUser()
const hasAgentProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes('agent')
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
