<template>
  <FireOrganismsProfileRoot
    :config="professionalConfig"
    :filter-composable="useProfessionalFilters"
  >
    <template #profile-pill="{ profile }">
      <div @click="navigateToProfessional(profile)" style="cursor: pointer">
        <JobProfilesProfessionalCardsPill :professional="profile" />
      </div>
    </template>

    <template #profile-card="{ profile }">
      <div @click="navigateToProfessional(profile)" style="cursor: pointer">
        <JobProfilesProfessionalCardsProfile :professional="profile" />
      </div>
    </template>

    <template #profile-item="{ profile }">
      <div @click="navigateToProfessional(profile)" style="cursor: pointer">
        <JobProfilesProfessionalCardsCell :professional="profile" />
      </div>
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
import { professionalConfig } from '../../models/profiles/Professional.model'
import { useProfessionalFilters } from '../../composables/profiles/useProfessionalFilters'

// Navigation function
const navigateToProfessional = (professional) => {
  if (professional?.uid) {
    navigateTo(`/professionals/${professional.uid}`)
  }
}

// Set page meta
definePageMeta({
  title: 'Browse Professionals',
  description: 'Find skilled culinary professionals for your team',
})
</script>
