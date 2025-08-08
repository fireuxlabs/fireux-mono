<template>
  <FireOrganismsProfileRoot
    :config="employerConfig"
    :filter-composable="useEmployerFilters"
  >
    <template #profile-pill="{ profile }">
      <JobOrganismsProfilesEmployerCardsPill :employer="profile" />
    </template>

    <template #profile-card="{ profile }">
      <JobOrganismsProfilesEmployerCardsProfile :employer="profile" />
    </template>

    <template #profile-item="{ profile }">
      <JobOrganismsProfilesEmployerCardsCell :employer="profile" />
    </template>
  </FireOrganismsProfileRoot>
</template>

<script setup>
// Set page meta
definePageMeta({
  title: 'Browse Employers',
  description: 'Find top restaurants and culinary establishments',
})
</script>
