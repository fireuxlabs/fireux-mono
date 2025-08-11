<template>
  <div>
    <div v-if="pending" class="loading-state">
      <h1>Loading your chef profile...</h1>
    </div>
    <div v-else-if="!appUser" class="error-state">
      <h1>Authentication Required</h1>
      <p>Please log in to edit your chef profile.</p>
      <NuxtLink to="/auth" class="back-link">← Go to Login</NuxtLink>
    </div>
    <ClientOnly v-else-if="chef">
      <MiseProfilesChefEdit :chef="chef" />
      <template #fallback>
        <div class="loading-state">
          <h1>Loading chef editor...</h1>
        </div>
      </template>
    </ClientOnly>
    <div v-else class="error-state">
      <h1>Chef Profile Not Found</h1>
      <p>You don't have a chef profile yet. Would you like to create one?</p>
      <NuxtLink to="/chefs" class="back-link">← Browse Chefs</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'

// Define static page meta first
definePageMeta({
  title: 'Edit Chef Profile',
  description: 'Edit your chef profile information',
})

// Get current user for authentication
const { appUser } = await useAppUser()

// Use our unified profile composable
const { fetchById } = await useProfile(chefConfig)

// Fetch the chef data using current user's ID
const {
  data: chef,
  pending,
  error,
} = await useAsyncData(
  `chef-edit-${appUser.value?.uid}`,
  () => appUser.value?.uid ? fetchById(appUser.value.uid) : null,
  {
    watch: [appUser]
  }
)

// Navigation function to go back to profile view
const navigateToProfile = () => {
  if (chef.value?.uid) {
    navigateTo(`/chefs/${chef.value.uid}`)
  }
}

// Update head dynamically when chef data loads
useHead({
  title: computed(() =>
    chef.value?.chef_name
      ? `Edit ${chef.value.chef_name} Profile`
      : 'Edit Chef Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(() => 'Edit your chef profile information and settings'),
    },
  ],
})
</script>
