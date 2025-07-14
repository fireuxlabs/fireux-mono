<template>
  <div class="profile-page">
    <div class="profile-page-header">
      <h1 class="profile-page-title">Browse Employers</h1>
      <p class="profile-page-description">
        Discover companies and organizations looking for talented culinary
        professionals.
      </p>
    </div>

    <div class="profile-page-content">
      <FireOrganismsProfilesEmployerList
        :employers="employers"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { employerConfig } from '../../models/profiles/Employer.model'

// Set page meta
definePageMeta({
  title: 'Browse Employers',
  description: 'Discover companies looking for culinary professionals',
})

// Use the profile composable to fetch employers
const { all: employers, loading } = await useProfile(employerConfig)
</script>

<style scoped>
/* Styles are now in shared _profiles.scss */
</style>
