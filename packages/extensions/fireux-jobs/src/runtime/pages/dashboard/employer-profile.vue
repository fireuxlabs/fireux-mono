<template>
  <ClientOnly>
    <div>
      <div v-if="employer">
        <h2>Edit Employer Profile</h2>
        <JobProfilesEmployerEdit :employer="employer" />
      </div>
      <div v-else>
        <JobProfilesEmployerCTA />
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading employer profile editor...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { employerConfig } from '../../models/profiles/Employer.model'

// Define static page meta first
definePageMeta({
  title: 'Edit Employer Profile',
  description: 'Edit your employer profile',
})

// Get current user
const { appUser, hasProfile } = await useAppUser()

// Use our unified profile composable
const { current: employer } = await useProfile(employerConfig)
</script>
