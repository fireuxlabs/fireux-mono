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
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard v-if="!hasAgentProfile">
          <div class="fallback">Agent profile not found.</div>
        </UCard>

        <UCard v-else-if="isProfileLoading">
          <div class="fallback loading">Agent profile data is loading.</div>
        </UCard>

        <UCard v-else-if="!resolvedCoreProfile">
          <div class="fallback">
            Your agent profile hasn’t been created yet.
          </div>
        </UCard>

        <ClientOnly v-else>
          <LayoutsDashboardProfileEdit class="grid gap-6 lg:grid-cols-2">
            <template #preview>
              <OrganismsProfilesAgentEditPreview />
            </template>

            <template #core>
              <OrganismsProfilesAgentEditCore :agent="resolvedCoreProfile" />
            </template>

            <template v-if="resolvedAppProfile" #app>
              <OrganismsProfilesAgentEditApp :agent="resolvedAppProfile" />
            </template>
          </LayoutsDashboardProfileEdit>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
import { agentConfig } from '../../../models/profiles/Agent/Agent.model.ts'

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

const isProfileLoading = computed(() => coreProfile.value === undefined)
const resolvedCoreProfile = computed(() => coreProfile.value ?? null)
const resolvedAppProfile = computed(() => appProfile.value ?? null)
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
