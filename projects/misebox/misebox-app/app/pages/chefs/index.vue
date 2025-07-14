<template>
  <div class="profile-page">
    <div class="profile-page-header">
      <h1 class="profile-page-title">Browse Chefs</h1>
      <p class="profile-page-description">
        Discover talented chefs available for hire and collaboration.
      </p>
    </div>

    <div class="profile-page-content">
      <OrganismsProfilesChefList :chefs="chefs" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../../packages/fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { chefConfig } from '../../../config/profiles/chef.config'

// Set page meta
definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})

// Use the profile composable to fetch chefs
const { all: chefs, loading } = await useProfile(chefConfig)
</script>

<style scoped>
/* Styles are now in shared _profiles.scss */
</style>
