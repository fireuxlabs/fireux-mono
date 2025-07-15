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
// Set page meta
definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})

// Use the profile composable to fetch chefs
const { all: chefs, loading } = await useProfile('chefs')
</script>

<style scoped>
.profile-page {
  @apply container mx-auto px-4 py-8;
}

.profile-page-header {
  @apply text-center mb-8;
}

.profile-page-title {
  @apply text-3xl font-bold text-gray-800 mb-4;
}

.profile-page-description {
  @apply text-lg text-gray-600 max-w-2xl mx-auto;
}

.profile-page-content {
  @apply mt-8;
}
</style>
