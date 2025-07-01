<template>
  <client-only>
    <div v-if="isProfessional">
      <FireOrganismsProfessionalCardsProfile
        :professional="currentProfessional"
      />
      <FireOrganismsProfessionalEdit :professional="currentProfessional" />
    </div>
    <FireOrganismsProfessionalCreateSystem v-else />
  </client-only>
</template>

<script setup>
import { useProfessionals } from '../../composables/firestore/objects/Professional/useProfessionals'

// Initialize professionals composable - now reactive and simple!
const { isProfessional, currentProfessional } = useProfessionals()

definePageMeta({
  layout: 'dashboard',
})
</script>
