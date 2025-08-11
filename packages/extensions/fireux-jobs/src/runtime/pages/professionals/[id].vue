<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading professional profile...</h1>
    </div>
    <div v-else-if="professional">
      <JobProfessionalProfile :professional="professional" />
    </div>
    <div v-else class="error-state">
      <h1>Professional Not Found</h1>
      <p>The professional profile you're looking for doesn't exist.</p>
      <NuxtLink to="/professionals" class="back-link">← Back to Professionals</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const professionalId = route.params.id

const { data: professional, pending } = await useFetch(`/api/professionals/${professionalId}`)

definePageMeta({
  title: computed(() => professional.value?.professional_name || 'Professional Profile'),
  description: computed(() => professional.value?.bio_short || 'View professional profile')
})
</script>

