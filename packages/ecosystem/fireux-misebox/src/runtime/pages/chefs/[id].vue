<template>
  <OrganismsProfilePage
    :config="chefConfig"
    edit-path="/dashboard/chef/profile"
    page-title="Chef Profile"
    page-description="View chef profile"
    :fallback-href="'/chefs'"
  >
    <template #profile="{ profile }">
      <OrganismsProfilesChefProfile :chef="profile" />
    </template>
  </OrganismsProfilePage>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'
</script>
