<template>
  <OrganismsProfilePage
    :config="employerConfig"
    edit-path="/dashboard/employer-profile"
    page-title="Employer Profile"
    page-description="View employer profile"
    :fallback-href="'/employers'"
  >
    <template #profile="{ profile }">
      <JobProfilesEmployerProfile :employer="profile" />
    </template>
  </OrganismsProfilePage>
</template>

<script setup lang="ts">
import OrganismsProfilePage from 'fireux-core/src/runtime/components/organisms/Profile/Page.vue'
import { employerConfig } from '../../models/profiles/Employer.model'
</script>
