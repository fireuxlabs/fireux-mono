<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading employer profile...</h1>
    </div>
    <ClientOnly v-else-if="employer">
      <JobProfilesEmployerProfile :employer="employer" />
      
      <!-- Edit Profile Button (shown for test ID 1234) -->
      <div v-if="employer.uid === '1234'" class="edit-profile-section">
        <FireButton 
          @click="navigateToEdit"
          variant="primary"
          class="edit-profile-button"
        >
          Edit Profile
        </FireButton>
      </div>
      
      <template #fallback>
        <div class="loading-state">
          <h1>Loading employer profile...</h1>
        </div>
      </template>
    </ClientOnly>
    <div v-else class="error-state">
      <h1>Employer Not Found</h1>
      <p>The employer profile you're looking for doesn't exist.</p>
      <NuxtLink to="/employers" class="back-link">← Back to Employers</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { employerConfig } from '../../models/profiles/Employer.model'

const route = useRoute()
const employerId = route.params.id as string

// Define static page meta first (no reactive data allowed)
definePageMeta({
  title: 'Employer Profile',
  description: 'View employer profile',
})

// Use our unified profile composable
const { fetchById } = await useProfile(employerConfig)

// Fetch the employer data using our composable
const {
  data: employer,
  pending,
  error,
} = await useAsyncData(`employer-${employerId}`, () => fetchById(employerId))

// Navigation function for edit profile
const navigateToEdit = () => {
  navigateTo('/dashboard/employer-profile')
}

// Update head dynamically when employer data loads
useHead({
  title: computed(() =>
    employer.value?.company_name
      ? `${employer.value.company_name} - Employer Profile`
      : 'Employer Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(
        () => employer.value?.bio_short || 'View employer profile'
      ),
    },
  ],
})
</script>
