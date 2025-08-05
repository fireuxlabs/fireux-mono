<template>
  <FireOrganismsProfilePage
    :config="chefConfig"
    :filter-composable="useChefFilters"
  >
    <template #profile-card="{ profile }">
      <MiseChefCardsProfile :chef="profile" />
    </template>

    <template #profile-item="{ profile }">
      <MiseChefCardsCell :chef="profile" />
    </template>
  </FireOrganismsProfilePage>
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
