<template>
  <div>
    <div v-if="!employer">
      <h1>Loading employer profile...</h1>
    </div>
    <div v-else-if="employer">
      <OrganismsProfilesEmployerProfile :employer="employer" />
    </div>
    <div v-else>
      <h1>Employer Not Found</h1>
      <p>The employer profile you're looking for doesn't exist.</p>
      <NuxtLink to="/employers" class="back-link">
        ← Back to Employers
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { employerConfig } from '../../../config/profiles/employer.config'

// Get the employer ID from the route
const route = useRoute()
const employerId = route.params.id

const { fetchEmployer } = await useProfile(employerConfig)

// fetchEmployer returns a ref, so we can use it directly
const employer = await fetchEmployer(String(employerId))

// Set page meta
definePageMeta({
  title: 'Employer Profile',
})
</script>
