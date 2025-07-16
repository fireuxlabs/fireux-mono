<template>
  <div class="profile-page">
    <div class="profile-page-header">
      <h1 class="profile-page-title">Browse Chefs</h1>
      <p class="profile-page-description">
        Discover talented chefs available for hire and collaboration.
      </p>
    </div>

    <div class="profile-page-content">
      <MiseChefList :chefs="chefs" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { chefConfig } from '../../models/profiles/Chef.model'

// Set page meta
definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})

// Use the profile composable to fetch chefs
const { all: chefs, loading } = await useProfile(chefConfig)
</script>

<style scoped>
.profile-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.profile-page-description {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 32rem;
  margin: 0 auto;
}

.profile-page-content {
  margin-top: 2rem;
}
</style>
