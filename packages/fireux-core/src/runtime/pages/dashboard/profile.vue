<template>
  <client-only>
    <div v-if="appUser">
      <!-- Profile Display -->
      <FireOrganismsUserCardsProfile :user="appUser" />

      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="profile-section-title">Edit Profile Information</h3>
        <UButton
          :icon="
            isEditMode ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          variant="ghost"
          size="sm"
          @click="isEditMode = !isEditMode"
        >
          {{ isEditMode ? 'Hide' : 'Edit' }}
        </UButton>
      </div>

      <!-- Edit Form (conditionally shown) -->
      <FireOrganismsUserEdit v-if="isEditMode" :user="appUser" />
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

// Edit mode state - controlled by this page
const isEditMode = ref(false)
</script>

<style scoped>
/* Profile page uses shared styles from main.css */
/* No custom styles needed - everything is in the shared profile classes */
</style>
