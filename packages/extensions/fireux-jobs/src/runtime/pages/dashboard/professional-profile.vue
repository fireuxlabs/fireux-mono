<template>
  <ClientOnly>
    <div>
      <div v-if="professional">
        <h2>Edit Professional Profile</h2>
        <JobProfilesProfessionalEdit :professional="professional" />
      </div>
      <div v-else>
        <JobProfilesProfessionalCTA />
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading professional profile editor...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../models/profiles/Professional.model'

// Define static page meta first
definePageMeta({
  title: 'Edit Professional Profile',
  description: 'Edit your professional profile',
})

// Get current user
const { appUser } = await useAppUser()

// Use our unified profile composable
const { current: professional } = await useProfile(professionalConfig)
</script>
