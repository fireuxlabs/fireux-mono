<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-profile">
    <template #header>
      <UDashboardNavbar :title="navTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard v-if="!hasProfessionalProfile">
          <div class="fallback">Professional profile not found.</div>
        </UCard>

        <UCard v-else-if="isProfileLoading">
          <div class="fallback loading">
            Professional profile data is loading.
          </div>
        </UCard>

        <UCard v-else-if="!resolvedCoreProfile">
          <div class="fallback">
            Your professional profile hasn’t been created yet.
          </div>
        </UCard>

        <div v-else class="grid gap-6 lg:grid-cols-2">
          <OrganismsProfilesProfessionalEditPreview />

          <OrganismsProfileEditProfile>
            <template #core>
              <OrganismsProfilesProfessionalEditCore
                :professional="resolvedCoreProfile"
              />
            </template>

            <template v-if="resolvedAppProfile" #app>
              <OrganismsProfilesProfessionalEditApp
                :professional="resolvedAppProfile"
              />
            </template>
          </OrganismsProfileEditProfile>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'
import { useProfessional } from '../../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { professionalConfig } from '../../../models/profiles/Professional/supporting'

const profileKey = professionalConfig.id ?? 'professional'
const navLabel =
  professionalConfig.navLabel ?? `${professionalConfig.profileType} Profile`
const navIcon = professionalConfig.navIcon ?? 'i-lucide-user'
const navTitle = navLabel

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-profile',
    label: navLabel,
    icon: navIcon,
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useProfessional()

const { user } = useUser()
const hasProfessionalProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes(profileKey)
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
