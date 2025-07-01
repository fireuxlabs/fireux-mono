<template>
  <client-only>
    <div v-if="isEmployer">
      <FireOrganismsEmployerCardsProfile :employer="currentEmployer" />
      <FireOrganismsEmployerEdit :employer="currentEmployer" />
    </div>
    <FireOrganismsEmployerCreateSystem v-else />
  </client-only>
</template>

<script setup>
import { useEmployers } from '../../composables/firestore/objects/Employer/useEmployers'

// Initialize employers composable - now reactive and simple!
const { isEmployer, currentEmployer } = useEmployers()

definePageMeta({
  layout: 'dashboard',
})
</script>
