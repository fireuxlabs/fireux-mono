<template>
  <OrganismsProfileRoot :config="professionalConfig">
    <template #profile-pill="{ profile }">
      <div @click="navigateToProfessional(profile)" style="cursor: pointer">
        <OrganismsProfilesProfessionalCardsPill :professional="profile" />
      </div>
    </template>

    <template #profile-card="{ profile }">
      <div @click="navigateToProfessional(profile)" style="cursor: pointer">
        <OrganismsProfilesProfessionalCardsProfile :professional="profile" />
      </div>
    </template>

    <template #profile-item="{ profile }">
      <div @click="navigateToProfessional(profile)" style="cursor: pointer">
        <OrganismsProfilesProfessionalCardsCell :professional="profile" />
      </div>
    </template>
  </OrganismsProfileRoot>
</template>

<script setup>
import { professionalConfig } from '../../models/profiles/Professional.model'

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
