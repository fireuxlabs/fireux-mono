packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue
<template>
  <DashboardEditStructure
    title="Chef Profile"
    description="Edit your chef identity and tenant-specific context."
  >
    <OrganismsProfileRoot :config="chefConfig">
      <template #current-assets="{ profile }">
        <div v-if="profile">
          <OrganismsProfilesChefEdit :chef="profile" />
        </div>
      </template>

      <template #item></template>
    </OrganismsProfileRoot>
  </DashboardEditStructure>
</template>

<script setup lang="ts">
// Nuxt macro type hint for package-level typecheck
declare function definePageMeta(meta: any): void
import DashboardEditStructure from 'fireux-core/runtime/components/layouts/dashboard/EditStructure.vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import OrganismsProfilesChefEdit from '../../components/organisms/profiles/Chef/Edit.vue'
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
