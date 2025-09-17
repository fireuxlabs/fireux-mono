<template>
  <ClientOnly>
    <div>
      <div v-if="employer">
        <JobProfilesEmployerProfile :employer="employer" />

        <!-- Edit Profile Button (shown when viewing own profile) -->
        <div v-if="appUser?.uid === employer.uid" class="edit-profile-section">
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
      </div>
      <div v-else class="error-state">
        <h1>Employer Not Found</h1>
        <p>The employer profile you're looking for doesn't exist.</p>
        <NuxtLink to="/employers" class="back-link"
          >← Back to Employers</NuxtLink
        >
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading employer profile...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useRoute, navigateTo } from '#app'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useAppUser } from 'fireux-core/runtime/composables/user/useAppUser'
import { employerConfig } from '../../models/profiles/Employer.model'

const route = useRoute()
const employerId = route.params.id as string

// Define static page meta first (no reactive data allowed)
definePageMeta({
  title: 'Employer Profile',
  description: 'View employer profile',
})

// Get current user for edit permission check
const { appUser } = useAppUser()

// Use our unified profile composable
const { fetchById } = useProfile(employerConfig)

// Fetch employer data
const employer = await fetchById(employerId)

// Navigation function for edit profile
const navigateToEdit = () => {
  navigateTo('/dashboard/employer-profile')
}

// Update head dynamically when employer data loads
useHead({
  title: computed(() =>
    (employer as any)?.name || (employer as any)?.company_name
      ? `${(employer as any)?.name || (employer as any)?.company_name} - Employer Profile`
      : 'Employer Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(
        () =>
          (employer as any)?.bioShort ||
          (employer as any)?.bio_short ||
          'View employer profile'
      ),
    },
  ],
})
</script>
