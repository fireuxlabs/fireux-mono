<template>
  <FireOrganismsProfilePage
    :config="employerConfig"
    :filter-composable="useEmployerFilters"
  >
    <template #profile-card="{ profile }">
      <JobEmployerCardsProfile :employer="profile" />
    </template>

    <template #profile-item="{ profile }">
      <JobEmployerCardsCell :employer="profile" />
    </template>
  </FireOrganismsProfilePage>
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
