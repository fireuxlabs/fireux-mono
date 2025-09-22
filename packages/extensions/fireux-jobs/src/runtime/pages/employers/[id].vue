<template>
  <ClientOnly>
    <div>
      <div v-if="employer">
        <JobProfilesEmployerProfile :employer="employer" />

        <!-- Edit Profile Button (shown when viewing own profile) -->
        <div
          v-if="appUser?.id === (employer as any)?.id"
          class="edit-profile-section"
        >
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
import { useHead, useRoute, navigateTo, useSeoMeta } from 'nuxt/app'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/useFirestoreRead'
import { employerConfig } from '../../models/profiles/Employer.model'

const route = useRoute()
const idParam = route.params.id
const employerId = Array.isArray(idParam) ? idParam[0] : String(idParam || '')

// Static SEO meta
useSeoMeta({
  title: 'Employer Profile',
  description: 'View employer profile',
})

// Get current user for edit permission check
const { user } = useUser()
const appUser = computed(() => user.value?.app)

// Fetch employer data via shared read composable
const { firestoreFetchDoc } = useFirestoreRead()
const employer = employerId
  ? await firestoreFetchDoc(employerConfig.collectionName, employerId)
  : null

// Navigation function for edit profile
const navigateToEdit = () => {
  navigateTo('/dashboard/employer-profile')
}

// Update head dynamically when employer data loads
useHead({
  title: computed(() =>
    (employer as any)?.value?.name || (employer as any)?.value?.company_name
      ? `${(employer as any)?.value?.name || (employer as any)?.value?.company_name} - Employer Profile`
      : 'Employer Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(
        () =>
          (employer as any)?.value?.bioShort ||
          (employer as any)?.value?.bio_short ||
          'View employer profile'
      ),
    },
  ],
})
</script>
