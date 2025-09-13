<template>
  <div class="page">
    <OrganismsProfilesChefCTA />
    <OrganismsProfileRoot
      :config="chefConfig"
      :filter-composable="useChefFilters"
    >
      <template #profile-pill="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsPill :chef="profile" />
        </div>
      </template>
      <template #profile-card="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsProfile :chef="profile" />
        </div>
      </template>
      <template #profile-item="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsCell :chef="profile" />
        </div>
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup>
import { chefConfig } from '../../models/profiles/Chef.model'
import { useChefFilters } from '../../composables/profiles/useChefFilters'

const navigateToChef = (chef) => {
  if (chef?.uid) {
    navigateTo(`/chefs/${chef.uid}`)
  }
}

definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})
</script>
