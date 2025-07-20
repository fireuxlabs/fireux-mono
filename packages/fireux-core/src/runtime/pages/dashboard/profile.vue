<template>
  <client-only>
    <div v-if="appUser" class="page">
      <!-- Profile Display -->
      <FireOrganismsAppUserCardsProfile :user="appUser" />

      <!-- Profile Edit Form -->
      <FireOrganismsAppUserEdit :user="appUser" />
    </div>
    <div v-else class="page">
      <UCard>
        <div class="text-center py-8">
          <UIcon
            name="i-heroicons-user-circle"
            class="w-12 h-12 mx-auto mb-4 text-gray-400"
          />
          <p>Loading profile...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/app/routes/useAppUserRoutes'

const route = useRoute()
const { label, icon } = getRouteMetaForPath(route.path)

// Set static meta at build time for Nuxt
definePageMeta({
  layout: 'dashboard',
})

// Set dynamic head meta at runtime (reactive)
useHead({
  title: label,
  meta: [{ name: 'icon', content: icon }],
})

// Get current user - follows same pattern as employer/professional
const { appUser } = await useAppUser()
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
