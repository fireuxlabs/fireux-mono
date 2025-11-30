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
      <div v-if="hasProfessionalProfile">
        <div
          v-if="coreProfile"
          class="space-y-6 px-0 py-0 sm:px-4 sm:py-4 lg:px-6"
        >
          <OrganismsProfilesProfessionalEditCore :professional="coreProfile" />
          <OrganismsProfilesProfessionalEditApp
            v-if="isTenant"
            :professional="appProfile"
          />
        </div>

        <div v-else class="fallback loading px-0 py-0 sm:px-4 sm:py-4">
          Professional profile data is loading.
        </div>
      </div>

      <div class="fallback px-0 py-0 sm:px-4 sm:py-4" v-else>
        Professional profile not found.
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfessional } from '../../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { professionalConfig } from '../../../models/profiles/Professional/supporting'

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
    profileId: 'professional',
  },
  requiresAuth: true,
})

const { coreProfile, appProfile } = useProfessional()
const { role, appId } = useFireUXConfig()
const isTenant = role === 'tenant' && !!appId

const { user } = useUser()
const hasProfessionalProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes('professional')
})
</script>

<style scoped>
.fallback {
  margin: 0;
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
