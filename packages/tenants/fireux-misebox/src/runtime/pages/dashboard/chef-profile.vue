<!-- packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue -->
<template>
  <UPageCard v-if="hasChefProfile" variant="subtle">

    <div v-if="coreProfile" class="space-y-6">
      <OrganismsProfilesChefEditCore :chef="coreProfile" />
      <OrganismsProfilesChefEditApp v-if="isTenant" :chef="appProfile" />
    </div>

    <div v-else class="fallback loading">Chef profile data is loading.</div>
  </UPageCard>

  <UCard v-else>
    <p class="fallback">Chef profile not found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
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
const { role, appId } = useFireUXConfig()
const isTenant = role === 'tenant' && !!appId

const { user } = useUser()
const hasChefProfile = computed(() => {
  const source = user.value?.profiles
  return Array.isArray(source) && source.includes('chef')
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
