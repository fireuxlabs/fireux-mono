<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/index.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-profile">
    <template #header>
      <UDashboardNavbar title="Professional Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="hasProfessionalProfile">
        <div v-if="coreProfile" class="space-y-6">
          <OrganismsProfilesProfessionalEditCore :professional="coreProfile" />
          <OrganismsProfilesProfessionalEditApp
            v-if="isTenant"
            :professional="appProfile"
          />
        </div>

        <div v-else class="fallback loading">
          Professional profile data is loading.
        </div>
      </div>

      <div v-else class="fallback">Professional profile not found.</div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfessional } from '../../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-profile',
    label: 'Professional Profile',
    icon: 'i-lucide-user-round-cog',
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
