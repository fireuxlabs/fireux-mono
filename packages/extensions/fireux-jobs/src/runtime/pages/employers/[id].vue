<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading employer profile...</h1>
    </div>
    <div v-else-if="employer">
      <JobEmployerProfile :employer="employer" />
    </div>
    <div v-else class="error-state">
      <h1>Employer Not Found</h1>
      <p>The employer profile you're looking for doesn't exist.</p>
      <NuxtLink to="/employers" class="back-link">← Back to Employers</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const employerId = route.params.id

const { data: employer, pending } = await useFetch(
  `/api/employers/${employerId}`
)

definePageMeta({
  title: computed(() => employer.value?.company_name || 'Employer Profile'),
  description: computed(
    () => employer.value?.bio_short || 'View employer profile'
  ),
})
</script>
