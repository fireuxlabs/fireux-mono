<template>
  <div v-if="employer">
    <FireOrganismsEmployerCardsProfile :employer="employer" />
  </div>
  <div v-else-if="loading">
    <p>Loading employer profile...</p>
  </div>
  <div v-else>
    <h1>Employer Not Found</h1>
    <p>The employer profile you're looking for doesn't exist.</p>
  </div>
</template>

<script setup>
import { useEmployers } from '../../composables/firestore/objects/Employer/useEmployers'

// Get the employer ID from the route
const route = useRoute()
const employerId = route.params.id

// Initialize employers composable
const { fetchEmployer } = useEmployers()

// State
const employer = ref(null)
const loading = ref(true)

// Fetch the employer profile
try {
  const employerRef = await fetchEmployer(String(employerId))
  employer.value = employerRef.value
} catch (error) {
  console.error('Failed to fetch employer:', error)
} finally {
  loading.value = false
}
</script>
