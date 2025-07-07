<template>
  <client-only>
    <div v-if="appUser" class="edit-page">
      <!-- Profile Display -->
      <FireOrganismsUserCardsProfile :user="appUser" />

      <!-- Profile Edit Form -->
      <FireOrganismsUserEdit :user="appUser" />
    </div>
    <div v-else class="loading-state">
      <UCard>
        <div class="loading-content">
          <UIcon name="i-heroicons-user-circle" class="loading-icon" />
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
.edit-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  margin: 0;
}

@media (min-width: 640px) {
  .edit-page {
    gap: var(--space-6);
  }
}

.loading-state {
  width: 100%;
}

.loading-content {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .loading-content {
    padding: var(--space-12) var(--space-4);
  }
}

.loading-icon {
  width: var(--space-10);
  height: var(--space-10);
  color: #d1d5db;
}

@media (min-width: 640px) {
  .loading-icon {
    width: var(--space-12);
    height: var(--space-12);
  }
}
</style>
