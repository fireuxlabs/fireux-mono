<template>
  <FireOrganismsProfileRoot
    :config="employerConfig"
    :filter-composable="useEmployerFilters"
  >
    <template #profile-pill="{ profile }">
      <div @click="navigateToEmployer(profile)" style="cursor: pointer;">
        <JobProfilesEmployerCardsPill :employer="profile" />
      </div>
    </template>

    <template #profile-card="{ profile }">
      <div @click="navigateToEmployer(profile)" style="cursor: pointer;">
        <JobProfilesEmployerCardsProfile :employer="profile" />
      </div>
    </template>

    <template #profile-item="{ profile }">
      <div @click="navigateToEmployer(profile)" style="cursor: pointer;">
        <JobProfilesEmployerCardsCell :employer="profile" />
      </div>
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
import { employerConfig } from '../../models/profiles/Employer.model'
import { useEmployerFilters } from '../../composables/profiles/useEmployerFilters'

// Navigation function
const navigateToEmployer = (employer) => {
  if (employer?.uid) {
    navigateTo(`/employers/${employer.uid}`)
  }
}

// Set page meta
definePageMeta({
  title: 'Browse Employers',
  description: 'Find top restaurants and culinary establishments',
})
</script>
