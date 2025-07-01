<template>
  <client-only>
    <div v-if="appUser">
      <FireOrganismsUserCardsProfile :user="appUser" />
      <FireOrganismsUserEdit :user="appUser" />
    </div>
    <div v-else class="profile-loading-state">
      <UCard>
        <div class="profile-loading-content">
          <UIcon name="i-heroicons-user-circle" class="profile-loading-icon" />
          <p>Loading profile...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/utils/useAppUserRoutes'

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
const { appUser } = useAppUser()
</script>

<style scoped>
/* Profile page uses shared styles from main.css */
/* No custom styles needed - everything is in the shared profile classes */
</style>
