<template>
  <div v-if="professional">
    <FireOrganismsProfessionalCardsProfile :professional="professional" />
  </div>
  <div v-else-if="loading">
    <p>Loading professional profile...</p>
  </div>
  <div v-else>
    <h1>Professional Not Found</h1>
    <p>The professional profile you're looking for doesn't exist.</p>
  </div>
</template>

<script setup>
import { useProfessionals } from '../../composables/firestore/objects/Professional/useProfessionals'

// Get the professional ID from the route
const route = useRoute()
const professionalId = route.params.id

// Initialize professionals composable
const { fetchProfessional } = useProfessionals()

// State
const professional = ref(null)
const loading = ref(true)

// Fetch the professional profile
try {
  const professionalRef = await fetchProfessional(String(professionalId))
  professional.value = professionalRef.value
} catch (error) {
  console.error('Failed to fetch professional:', error)
} finally {
  loading.value = false
}
</script>
