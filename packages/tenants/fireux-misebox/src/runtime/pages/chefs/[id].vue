<template>
  <ClientOnly>
    <div>
      <div v-if="chef">
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
      </div>
      <div v-else class="error-state">
        <h1>Chef Not Found</h1>
        <p>The chef profile you're looking for doesn't exist.</p>
        <NuxtLink to="/chefs" class="back-link">← Back to Chefs</NuxtLink>
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading chef profile...</h1>
      </div>
    </template>
  </ClientOnly>
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

// Fetch chef data
const chef = await fetchById(chefId)

// Navigation function for edit profile
const navigateToEdit = () => {
  navigateTo('/dashboard/chef-profile')
}

// Update head dynamically when chef data loads
useHead({
  title: computed(() =>
    chef && chef.chef_name ? `${chef.chef_name} - Chef Profile` : 'Chef Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        chef && chef.bio_short ? chef.bio_short : 'View chef profile'
      ),
    },
  ],
})
</script>
