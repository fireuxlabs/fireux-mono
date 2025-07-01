<template>
  <div>
    <h1>Browse Employers</h1>
    <p class="mb-6">Discover companies looking for talented professionals.</p>

    <FireOrganismsEmployerList :employers="employers" :loading="loading" />
  </div>
</template>

<script setup>
import { useEmployers } from '../../composables/firestore/objects/Employer/useEmployers'

const { getEmployersCollection } = useEmployers()

// State
const employers = ref([])
const loading = ref(true)

// Fetch employers on mount
onMounted(async () => {
  try {
    const employersCollection = await getEmployersCollection()
    employers.value = employersCollection.value || []
  } catch (error) {
    console.error('Failed to fetch employers:', error)
  } finally {
    loading.value = false
  }
})
</script>
