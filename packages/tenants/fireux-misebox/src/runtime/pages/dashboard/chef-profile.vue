<template>
  <ClientOnly>
    <div>
      <div v-if="chef">
        <h2>Edit Chef Profile</h2>
        <MiseProfilesChefEdit :chef="chef" />
      </div>
      <div v-else>
        <MiseProfilesChefCTA />
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading chef profile editor...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'

// Define static page meta first
definePageMeta({
  title: 'Edit Chef Profile',
  description: 'Edit your chef profile',
})

// Get current user
const { appUser, hasProfile } = await useAppUser()

// Use our unified profile composable
const { current: chef } = await useProfile(chefConfig)
</script>
