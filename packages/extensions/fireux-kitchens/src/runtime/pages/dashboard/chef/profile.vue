<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-chef-profile">
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
        <ProfilesChefIdentity v-if="view === 'profile'" />

        <ClientOnly v-else>
          <div class="console-profile__section">
            <ProfilesChefEditCore />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { chefConfig } from 'fireux-kitchens/runtime/composables/fireux/firestore/profiles/Chef/config/chefConfig'
import { ref } from 'vue'

const profileKey = chefConfig.id ?? 'chef'
const navLabel = chefConfig.navLabel ?? `${chefConfig.profileType} Profile`
const navIcon = chefConfig.navIcon ?? 'i-lucide-chef-hat'
const navTitle = navLabel

const view = ref<'profile' | 'edit'>('profile')

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
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
