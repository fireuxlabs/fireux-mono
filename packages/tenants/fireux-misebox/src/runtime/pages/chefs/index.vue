<template>
  <FireOrganismsProfileRoot
    :config="chefConfig"
    :filter-composable="useChefFilters"
  >
    <template #profile-pill="{ profile }">
      <MiseProfilesChefCardsPill :chef="profile" />
    </template>

    <template #profile-card="{ profile }">
      <MiseProfilesChefCardsProfile :chef="profile" />
    </template>

    <template #profile-item="{ profile }">
      <MiseProfilesChefCardsCell :chef="profile" />
    </template>
  </FireOrganismsProfileRoot>
</template>
<script setup>
import { chefConfig } from '../../models/profiles/Chef.model'
import { useChefFilters } from '../../composables/profiles/useChefFilters'

// Set page meta
definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})
</script>
