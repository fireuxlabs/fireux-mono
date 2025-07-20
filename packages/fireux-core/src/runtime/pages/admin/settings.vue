<template>
  <client-only>
    <div v-if="isAdmin" class="page">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold">App Settings</h1>
          <UBadge color="blue" variant="subtle">Admin Access</UBadge>
        </div>
      </div>

      <!-- App Profile Display -->
      <FireOrganismsAppCardsProfile :app="app" />

      <!-- App Edit Form -->
      <FireOrganismsAppEdit />
    </div>
    <div v-else class="page">
      <UCard>
        <div class="text-center py-8">
          <UIcon
            name="i-heroicons-lock-closed"
            class="w-12 h-12 mx-auto mb-4 text-gray-400"
          />
          <h2 class="text-xl font-semibold mb-2">Access Denied</h2>
          <p class="text-gray-600">
            You need admin privileges to access app settings.
          </p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup>
// Set static meta at build time for Nuxt
definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'admin-dashboard',
  },
})

// Set dynamic head meta at runtime (reactive)
useHead({
  title: 'App Settings',
  meta: [{ name: 'icon', content: 'i-heroicons-cog-6-tooth' }],
})

// Get app and check admin access
const { app, isAdmin } = useApp()
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
