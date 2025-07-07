<template>
  <client-only>
    <div v-if="isAdmin" class="edit-page">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">App Settings</h1>
        <UBadge color="blue" variant="subtle">Admin Access</UBadge>
      </div>

      <!-- App Profile Display -->
      <FireOrganismsAppCardsProfile :app="app" />

      <!-- App Edit Form -->
      <FireOrganismsAppEdit />
    </div>
    <div v-else class="loading-state">
      <UCard>
        <div class="loading-content">
          <UIcon name="i-heroicons-lock-closed" class="loading-icon" />
          <h2 class="loading-title">Access Denied</h2>
          <p class="loading-text">
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

.page-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid #e5e7eb;
}

@media (min-width: 640px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

@media (min-width: 640px) {
  .page-title {
    font-size: 2.25rem;
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

.loading-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

@media (min-width: 640px) {
  .loading-title {
    font-size: 1.5rem;
  }
}

.loading-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

@media (min-width: 640px) {
  .loading-text {
    font-size: 1rem;
  }
}
</style>
