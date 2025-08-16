<template>
  <FireOrganismsProfileRoot
    :config="chefConfig"
    :filter-composable="useChefFilters"
  >
    <template #profile-pill="{ profile }">
      <div @click="navigateToChef(profile)" class="cursor-pointer">
        <MiseProfilesChefCardsPill :chef="profile" />
      </div>
    </template>

    <template #profile-card="{ profile }">
      <div @click="navigateToChef(profile)" class="cursor-pointer">
        <MiseProfilesChefCardsProfile :chef="profile" />
      </div>
    </template>

    <template #profile-item="{ profile }">
      <div @click="navigateToChef(profile)" class="cursor-pointer">
        <MiseProfilesChefCardsCell :chef="profile" />
      </div>
    </template>
  </FireOrganismsProfileRoot>
</template>
<script setup>
import { chefConfig } from '../../models/profiles/Chef.model'
import { useChefFilters } from '../../composables/profiles/useChefFilters'

// Navigation function
const navigateToChef = (chef) => {
  if (chef?.uid) {
    navigateTo(`/chefs/${chef.uid}`)
  }
}

// Set page meta
definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})
</script>
