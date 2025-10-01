<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="chefConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Chef Profile</h2>
            <OrganismsProfilesChefEdit :chef="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Nuxt macro type hint for package-level typecheck
declare function definePageMeta(meta: any): void
import { chefConfig } from '../../models/profiles/Chef.model'
// pages/dashboard/chef-profile.vue (same pattern for others)
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-chef-profile',
    label: 'Chef Profile',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'chef', // expose to useNav
  },
  requiresAuth: true,
})
</script>
