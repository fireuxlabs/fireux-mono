<template>
  <div class="profile-page">
    <div class="profile-page-header">
      <h1 class="profile-page-title">Browse Suppliers</h1>
      <p class="profile-page-description">
        Connect with quality suppliers for your culinary business needs.
      </p>
    </div>

    <div class="profile-page-content">
      <MiseSupplierList :suppliers="suppliers" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
// Set page meta
definePageMeta({
  title: 'Browse Suppliers',
  description: 'Find reliable suppliers for your restaurant needs',
})

// Use the profile composable to fetch suppliers
const { all: suppliers, loading } = await useProfile('suppliers')
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
