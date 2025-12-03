<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-agent-profile">
    <template #header>
      <UDashboardNavbar :title="navTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="hasAgentProfile">
        <OrganismsProfileEditProfile v-if="coreProfile">
          <template #core>
            <OrganismsProfilesAgentEditCore :agent="coreProfile" />
          </template>

          <template v-if="appProfile" #app>
            <OrganismsProfilesAgentEditApp :agent="appProfile" />
          </template>
        </OrganismsProfileEditProfile>

        <div v-else class="fallback loading">
          Agent profile data is loading.
        </div>
      </div>

      <div v-else class="fallback">Agent profile not found.</div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'
import { useAgent } from '../../../composables/firestore/profiles/Agent/useAgent'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { agentConfig } from '../../../models/profiles/Agent.model'

const navLabel = agentConfig.navLabel ?? `${agentConfig.profileType} Profile`
const navIcon = agentConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-agent-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useAgent()

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
