<template>
  <FireOrganismsProfileRoot
    :config="professionalConfig"
    :filter-composable="useProfessionalFilters"
  >
    <template #profile-pill="{ profile }">
      <JobProfilesProfessionalCardsPill :professional="profile" />
    </template>

    <template #profile-card="{ profile }">
      <JobProfilesProfessionalCardsProfile :professional="profile" />
    </template>

    <template #profile-item="{ profile }">
      <JobProfilesProfessionalCardsCell :professional="profile" />
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
import { professionalConfig } from '../../models/profiles/Professional.model'
import { useProfessionalFilters } from '../../composables/profiles/useProfessionalFilters'

// Set page meta
definePageMeta({
  title: 'Browse Professionals',
  description: 'Find skilled culinary professionals for your team',
})
</script>
