<!-- FILE: packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-chef-profile">
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
        <ChefIdentity v-if="view === 'profile'" />

        <ClientOnly v-else>
          <div class="workspace-profile__section">
            <ChefEdit />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { chefConfig } from '../../../user/composables/firestore/profiles/Chef/config/chefConfig'
import { ref } from 'vue'

const profileKey = chefConfig.kind
const navLabel = chefConfig.navLabel ?? `${chefConfig.profileType} Profile`
const navIcon = chefConfig.navIcon ?? 'i-lucide-chef-hat'
const navTitle = navLabel

const view = ref<'profile' | 'edit'>('profile')

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-kitchens'], profiles: ['chef'] },
    key: 'dashboard-chef-profile',
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
