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
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'chef-profile',
    label: 'Chef Profile',
    icon: 'i-lucide-chef-hat',
    desktop: false,
    mobile: true,
    order: 10,
    group: 'Profiles',
  },
  // Custom marker for inclusion in Profiles menu
  ProfileMenu: true,
  // tolerate common misspelling
  PofileMenu: true,
  // Gates
  tenant: 'misebox',
  requiresAuth: true,
  roles: [],
})
</script>
