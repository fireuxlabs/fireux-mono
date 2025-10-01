<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="employerConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Employer Profile</h2>
            <JobProfilesEmployerEdit :employer="profile" />
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
import { employerConfig } from '../../models/profiles/Employer.model'
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-employer-profile',
    label: 'Employer Profile',
    icon: 'i-lucide-briefcase-business',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'employer',
  },
  requiresAuth: true,
})
</script>
