<template>
  <FireOrganismsProfileRoot
    :config="professionalConfig"
    :filter-composable="useProfessionalFilters"
  >
    <template #profile-pill="{ profile }">
      <JobOrganismsProfilesProfessionalCardsPill
        :professional="currentUserProfile || profile"
      />
    </template>

    <template #profile-card="{ profile }">
      <JobOrganismsProfilesProfessionalCardsProfile :professional="profile" />
    </template>

    <template #profile-item="{ profile }">
      <JobOrganismsProfilesProfessionalCardsCell :professional="profile" />
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
import { professionalConfig } from '../../models/profiles/Professional.model'
import { useProfessionalFilters } from '../../composables/profiles/useProfessionalFilters'

// Get current user's professional profile
const { currentProfessional } = await useProfile(professionalConfig)
const currentUserProfile = currentProfessional

// Set page meta
definePageMeta({
  title: 'Browse Professionals',
  description: 'Find skilled culinary professionals for your team',
})
</script>
