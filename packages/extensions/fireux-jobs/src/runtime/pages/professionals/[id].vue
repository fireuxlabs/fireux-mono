<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading professional profile...</h1>
    </div>
    <ClientOnly v-else-if="professional">
      <JobProfilesProfessionalProfile :professional="professional" />

      <!-- Edit Profile Button (shown when viewing own profile) -->
      <div v-if="appUser?.uid === professional.uid" class="edit-profile-section">
        <UButton
          @click="navigateToEdit"
          icon="i-lucide-pencil"
          size="md"
          color="primary"
          variant="solid"
          class="edit-profile-button"
        >
          Edit Profile
        </UButton>
      </div>

      <template #fallback>
        <div class="loading-state">
          <h1>Loading professional profile...</h1>
        </div>
      </template>
    </ClientOnly>
    <div v-else class="error-state">
      <h1>Professional Not Found</h1>
      <p>The professional profile you're looking for doesn't exist.</p>
      <NuxtLink to="/professionals" class="back-link"
        >← Back to Professionals</NuxtLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../models/profiles/Professional.model'

const route = useRoute()
const professionalId = route.params.id as string

// Define static page meta first (no reactive data allowed)
definePageMeta({
  title: 'Professional Profile',
  description: 'View professional profile',
})

// Get current user for edit permission check
const { appUser } = await useAppUser()

// Use our unified profile composable
const { fetchById } = await useProfile(professionalConfig)

// Fetch the professional data using our composable
const {
  data: professional,
  pending,
  error,
} = await useAsyncData(`professional-${professionalId}`, () =>
  fetchById(professionalId)
)

// Navigation function for edit profile
const navigateToEdit = () => {
  navigateTo('/dashboard/professional-profile')
}

// Update head dynamically when professional data loads
useHead({
  title: computed(() =>
    professional.value?.professional_name
      ? `${professional.value.professional_name} - Professional Profile`
      : 'Professional Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(
        () => professional.value?.bio_short || 'View professional profile'
      ),
    },
  ],
})
</script>
