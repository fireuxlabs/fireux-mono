<template>
  <ClientOnly>
    <div class="dashboard-page-grid">
      <!-- Blog Create Section -->
      <FireOrganismsBlogCreateSystem class="dashboard-grid-section" />
    </div>
  </ClientOnly>
</template>

<script setup>
import { useAdminRoutes } from '../../composables/app/routes/useAdminRoutes'

const adminGroup = useAdminRoutes()[0]
const route = adminGroup.children.find((r) => r.to === '/admin/blog')
const { label, icon } = route

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
.dashboard-page-grid {
  column-count: unset !important;
}
</style>
