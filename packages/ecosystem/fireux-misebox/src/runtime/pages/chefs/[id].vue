<template>
  <OrganismsProfilePage
    :config="chefConfig"
    edit-path="/dashboard/chef-profile"
    page-title="Chef Profile"
    page-description="View chef profile"
    :fallback-href="'/chefs'"
  >
    <!-- Custom renderer: reuse your rich card -->
    <template #profile="{ profile }">
      <OrganismsProfilesChefCardsProfile :chef="profile" />
    </template>
  </OrganismsProfilePage>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'
</script>
