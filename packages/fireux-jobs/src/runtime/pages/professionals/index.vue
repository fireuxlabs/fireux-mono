<template>
  <div class="profile-page">
    <div class="profile-page-header">
      <h1 class="profile-page-title">Browse Professionals</h1>
      <p class="profile-page-description">
        Find skilled culinary professionals for your next project or position.
      </p>
    </div>
    <div class="profile-page-content">
      <FireOrganismsProfilesProfessionalList
        :professionals="professionals"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { professionalConfig } from '../../models/profiles/Professional.model'

// Set page meta
definePageMeta({
  title: 'Browse Professionals',
  description: 'Find skilled culinary professionals for your projects',
})

// Use the profile composable to fetch professionals
const { all: professionals, loading } = await useProfile(professionalConfig)
</script>

<style scoped>
/* Styles are now in shared _profiles.scss */
</style>
