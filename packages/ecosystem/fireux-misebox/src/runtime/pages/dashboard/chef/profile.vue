<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-chef-profile">
    <template #header>
      <UDashboardNavbar title="Chef Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard v-if="!hasChefProfile">
          <div class="fallback">Chef profile not found.</div>
        </UCard>

        <UCard v-else-if="isProfileLoading">
          <div class="fallback loading">Chef profile data is loading.</div>
        </UCard>

        <UCard v-else-if="!resolvedCoreProfile">
          <div class="fallback">Your chef profile hasn’t been created yet.</div>
        </UCard>

        <ClientOnly v-else>
          <LayoutsDashboardProfileEdit class="grid gap-6 lg:grid-cols-2">
            <template #preview>
              <OrganismsProfilesChefEditPreview />
            </template>

            <template #core>
              <OrganismsProfilesChefEditCore :chef="resolvedCoreProfile" />
            </template>

            <template v-if="resolvedAppProfile" #app>
              <OrganismsProfilesChefEditApp :chef="resolvedAppProfile" />
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
import { useChef } from '../../../composables/firestore/profiles/Chef/useChef'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-chef-profile',
    label: 'Chef Profile',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'chef',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useChef()

const { user } = useUser()
const hasChefProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes('chef')
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
