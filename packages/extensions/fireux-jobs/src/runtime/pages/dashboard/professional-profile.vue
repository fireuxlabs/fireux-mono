<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="professionalConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Professional Profile</h2>
            <JobProfilesProfessionalEdit :professional="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { professionalConfig } from '../../models/profiles/Professional.model'
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'professional-profile',
    label: 'Professional Profile',
    icon: 'i-lucide-user-round-cog',
    desktop: false,
    mobile: true,
    order: 40,
    group: 'Profiles',
  },
  ProfileMenu: true,
  PofileMenu: true,
  tenant: 'misebox',
  requiresAuth: true,
  roles: [],
})
</script>
