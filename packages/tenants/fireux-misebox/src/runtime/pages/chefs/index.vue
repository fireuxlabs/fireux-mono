<template>
  <div class="page">
    <MiseOrganismsProfilesChefCTA />
    <FireOrganismsProfileRoot
      :config="chefConfig"
      :filter-composable="useChefFilters"
    >
      <template #profile-pill="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <MiseOrganismsProfilesChefCardsPill :chef="profile" />
        </div>
      </template>
      <template #profile-card="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <MiseOrganismsProfilesChefCardsProfile :chef="profile" />
        </div>
      </template>
      <template #profile-item="{ profile }">
        <div @click="navigateToChef(profile)" class="cursor-pointer">
          <MiseOrganismsProfilesChefCardsCell :chef="profile" />
        </div>
      </template>
    </FireOrganismsProfileRoot>
  </div>
</template>

<script setup>
import { chefConfig } from '../../models/profiles/Chef.model'
import { useChefFilters } from '../../composables/profiles/useChefFilters'

const { current } = await useProfile(chefConfig)

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
