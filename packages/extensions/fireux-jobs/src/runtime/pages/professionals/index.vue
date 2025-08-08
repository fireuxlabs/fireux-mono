<template>
  <FireOrganismsProfileRoot
    :config="professionalConfig"
    :filter-composable="useProfessionalFilters"
  >
    <template #profile-pill="{ profile }">
      <JobOrganismsProfilesProfessionalCardsPill :professional="profile" />
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
// Set page meta
definePageMeta({
  title: 'Browse Professionals',
  description: 'Find skilled culinary professionals for your team',
})
</script>
