<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading chef profile...</h1>
    </div>
    <ClientOnly v-else-if="chef">
      <MiseProfilesChefProfile :chef="chef" />

      <!-- Edit Profile Button (shown when viewing own profile) -->
      <div v-if="appUser?.uid === chef.uid" class="edit-profile-section">
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
          <h1>Loading chef profile...</h1>
        </div>
      </template>
    </ClientOnly>
    <div v-else class="error-state">
      <h1>Chef Not Found</h1>
      <p>The chef profile you're looking for doesn't exist.</p>
      <NuxtLink to="/chefs" class="back-link">← Back to Chefs</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'

const route = useRoute()
const chefId = route.params.id as string

// Define static page meta first (no reactive data allowed)
definePageMeta({
  title: 'Chef Profile',
  description: 'View chef profile',
})

// Get current user for edit permission check
const { appUser } = await useAppUser()

// Use our unified profile composable
const { fetchById } = await useProfile(chefConfig)

// Fetch the chef data using our composable
const {
  data: chef,
  pending,
  error,
} = await useAsyncData(`chef-${chefId}`, () => fetchById(chefId))

// Navigation function for edit profile
const navigateToEdit = () => {
  navigateTo('/dashboard/chef-profile')
}

// Update head dynamically when chef data loads
useHead({
  title: computed(() =>
    chef.value?.chef_name
      ? `${chef.value.chef_name} - Chef Profile`
      : 'Chef Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(() => chef.value?.bio_short || 'View chef profile'),
    },
  ],
})
</script>
