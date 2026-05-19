<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue -->
<template>
  <UDashboardPanel
    id="dashboard-professional-profile"
    :ui="{ body: 'flex flex-col gap-4 flex-1 overflow-y-auto p-2 sm:p-4' }"
  >
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
        <ProfilesProfessionalIdentity v-if="view === 'profile'" />

        <ClientOnly v-else>
          <div class="console-profile__section">
            <ProfilesProfessionalEditCore />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { professionalConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/config/professionalConfig'
import { ref } from 'vue'

const profileKey = professionalConfig.id ?? 'professional'
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
