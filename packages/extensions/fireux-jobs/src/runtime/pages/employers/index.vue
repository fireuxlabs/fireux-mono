<template>
  <FireOrganismsProfileRoot
    :config="employerConfig"
    :filter-composable="useEmployerFilters"
  >
    <template #profile-pill="{ profile }">
      <JobProfilesEmployerCardsPill :employer="profile" />
    </template>

    <template #profile-card="{ profile }">
      <JobProfilesEmployerCardsProfile :employer="profile" />
    </template>

    <template #profile-item="{ profile }">
      <JobProfilesEmployerCardsCell :employer="profile" />
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
import { employerConfig } from '../../models/profiles/Employer.model'
import { useEmployerFilters } from '../../composables/profiles/useEmployerFilters'

// Set page meta
definePageMeta({
  title: 'Browse Employers',
  description: 'Find top restaurants and culinary establishments',
})
</script>
