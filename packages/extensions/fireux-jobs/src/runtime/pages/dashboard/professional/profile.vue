<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue -->
<template>
  <UDashboardPanel
    id="dashboard-professional-profile"
    :ui="{ body: 'flex flex-col gap-4 flex-1 overflow-y-auto p-2 sm:p-4' }"
  >
    <template #header>
      <FireLayoutsDashboardNavbar :title="navTitle">
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
      </FireLayoutsDashboardNavbar>
    </template>

    <template #body>
      <div class="workspace-profile">
        <ProfessionalIdentity v-if="view === 'profile'" />

        <ClientOnly v-else>
          <div class="workspace-profile__section">
            <ProfessionalEdit />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../../user/composables/profiles/Professional/config/professionalConfig'
import { ref } from 'vue'

const profileKey = professionalConfig.kind
const navLabel =
  professionalConfig.navLabel ?? `${professionalConfig.profileType} Profile`
const navIcon = professionalConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

const view = ref<'profile' | 'edit'>('profile')

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'], profiles: ['professional'] },
    key: 'dashboard-professional-profile',
    label: navLabel,
    icon: navIcon,
    position: 'middle',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})
</script>
