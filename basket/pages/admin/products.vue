<template>
  <ClientOnly>
    <div class="dashboard-page-grid">
      <!-- Product Create Section -->
      <OrganismsProductCreateSystem class="dashboard-grid-section" />

      <!-- Future sections can be added here, such as product stats or links -->
    </div>
  </ClientOnly>
</template>

<script setup>
import { getRouteMetaForPath } from '~/composables/utils/useRoutes'

const { label, icon } = getRouteMetaForPath('/admin/products')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'admin-dashboard'
  },
  title: label,
  icon: icon
})
</script>

<style scoped>
.dashboard-grid-section {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .dashboard-page-grid .dashboard-grid-section:first-child {
    max-width: 720px; /* Adjust this value to control width */
  }
}
</style>
