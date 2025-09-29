<template>
  <OrganismsProfilePage
    :config="professionalConfig"
    edit-path="/dashboard/professional-profile"
    page-title="Professional Profile"
    page-description="View professional profile"
    :fallback-href="'/professionals'"
  >
    <template #profile="{ profile }">
      <JobProfilesProfessionalProfile :professional="profile" />
    </template>
  </OrganismsProfilePage>
</template>

<script setup lang="ts">
import OrganismsProfilePage from 'fireux-core/src/runtime/components/organisms/Profile/Page.vue'
import { professionalConfig } from '../../models/profiles/Professional.model'
</script>
