packages/extensions/fireux-jobs/src/runtime/pages/dashboard/employer-profile.vue
<template>
  <DashboardEditStructure
    title="Employer Profile"
    description="Keep your employer brand details up to date."
  >
    <OrganismsProfileRoot :config="employerConfig">
      <template #current-assets="{ profile }">
        <div v-if="profile">
          <JobProfilesEmployerEdit :employer="profile" />
        </div>
      </template>

      <template #item></template>
    </OrganismsProfileRoot>
  </DashboardEditStructure>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import DashboardEditStructure from 'fireux-core/runtime/components/layouts/dashboard/EditStructure.vue'
import { employerConfig } from '../../models/profiles/Employer.model'
import JobProfilesEmployerEdit from '../../components/Organisms/profiles/Employer/Edit.vue'
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
