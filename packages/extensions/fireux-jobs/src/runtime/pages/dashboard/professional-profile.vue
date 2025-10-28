packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional-profile.vue
<template>
  <DashboardEditStructure
    title="Professional Profile"
    description="Manage how employers see your professional presence."
  >
    <OrganismsProfileRoot :config="professionalConfig">
      <template #current-assets="{ profile }">
        <div v-if="profile">
          <JobProfilesProfessionalEdit :professional="profile" />
        </div>
      </template>

      <template #item></template>
    </OrganismsProfileRoot>
  </DashboardEditStructure>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import DashboardEditStructure from 'fireux-core/runtime/components/layouts/dashboard/EditStructure.vue'
import { professionalConfig } from '../../models/profiles/Professional.model'
import JobProfilesProfessionalEdit from '../../components/Organisms/profiles/Professional/Edit.vue'
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
</script>
