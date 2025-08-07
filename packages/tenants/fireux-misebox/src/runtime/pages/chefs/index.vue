<template>
  <FireOrganismsProfileRoot
    :config="chefConfig"
    :filter-composable="useChefFilters"
  >
    <template #profile-pill="{ profile }">
      <MiseChefCardsPill :chef="currentUserProfile || profile" />
    </template>

    <template #profile-card="{ profile }">
      <MiseChefCardsProfile :chef="profile" />
    </template>

    <template #profile-item="{ profile }">
      <MiseChefCardsCell :chef="profile" />
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
import { chefConfig } from '../../models/profiles/Chef.model'
import { useChefFilters } from '../../composables/profiles/useChefFilters'

// Get current user's chef profile
const profileData = await useProfile(chefConfig)
const currentUserProfile = profileData[`current${chefConfig.profileType}`]

// Set page meta
definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})
</script>
