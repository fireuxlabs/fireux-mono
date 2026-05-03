<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-agent-profile">
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle">
        <template #right>
          <div class="inline-flex items-center gap-1">
            <UButton
              icon="i-lucide-eye"
              size="sm"
              :variant="view === 'profile' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="View profile"
              @click="view = 'profile'"
            />

            <UButton
              icon="i-lucide-notebook-pen"
              size="sm"
              :variant="view === 'edit' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="Edit profile"
              @click="view = 'edit'"
            />
          </div>
        </template>
      </LayoutsDashboardNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <ProfilesAgentIdentity v-if="view === 'profile'" />

        <ClientOnly v-else>
          <div class="console-profile__section">
            <ProfilesAgentEditCore />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'
import { ref } from 'vue'

const navLabel = agentConfig.navLabel ?? `${agentConfig.profileType} Profile`
const navIcon = agentConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

const view = ref<'profile' | 'edit'>('profile')

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
