<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-agent-profile">
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle" />
    </template>

    <template #body>
      <div class="console-profile">
        <ProfilesAgentIdentity />

        <ProfilesAgentEditCore />

        <ProfilesAgentEditApp v-if="showAppProfileSection" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'

const navLabel = agentConfig.navLabel ?? `${agentConfig.profileType} Profile`
const navIcon = agentConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

const showAppProfileSection = false

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'] },
    key: 'dashboard-agent-profile',
    label: navLabel,
    icon: navIcon,
    position: 'middle',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})
</script>
