<template>
  <ClientOnly>
    <div class="dashboard-page-grid">
      <!-- Product Create Section -->
      <FireOrganismsProductCreateSystem class="dashboard-grid-section" />
    </div>
  </ClientOnly>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/app/routes/useAppUserRoutes'

const { label, icon } = getRouteMetaForPath('/admin/products')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'admin-dashboard',
  },
  title: label,
  icon: icon,
})
</script>

<style scoped>
/* Override the global masonry grid for this specific page */
.dashboard-page-grid {
  column-count: unset !important;
  display: block;
}

.dashboard-grid-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  break-inside: unset;
}

/* Tablet and up - center horizontally */
@media (min-width: 768px) {
  .dashboard-grid-section {
    align-items: center;
  }
}

/* Desktop - constrain width */
@media (min-width: 1024px) {
  .dashboard-grid-section {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
