<template>
  <OrganismsProfileRoot :config="employerConfig">
    <template #profile-pill="{ profile }">
      <div @click="navigateToEmployer(profile)" style="cursor: pointer">
        <OrganismsProfilesEmployerCardsPill :employer="profile" />
      </div>
    </template>

    <template #profile-card="{ profile }">
      <div @click="navigateToEmployer(profile)" style="cursor: pointer">
        <OrganismsProfilesEmployerCardsProfile :employer="profile" />
      </div>
    </template>

    <template #profile-item="{ profile }">
      <div @click="navigateToEmployer(profile)" style="cursor: pointer">
        <OrganismsProfilesEmployerCardsCell :employer="profile" />
      </div>
    </template>
  </OrganismsProfileRoot>
</template>

<script setup>
import { employerConfig } from '../../models/profiles/Employer.model'

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
