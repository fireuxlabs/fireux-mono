<template>
  <client-only>
    <div class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <OrganismsAdminMetricsUser />
      </div>
      <div class="dashboard-grid-section">
        <OrganismsAdminMetricsProducts />
      </div>
      <div class="dashboard-grid-section">
        <OrganismsAdminMetricsBlog />
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { useAdminRoutes } from '../../composables/app/routes/useAdminRoutes'

const adminGroup = useAdminRoutes()[0]
const route = adminGroup.children.find((r) => r.to === '/admin')
const { label, icon } = route

definePageMeta({
  layout: 'dashboard',
  layoutProps: { dashboardType: 'admin-dashboard' },
  title: label,
  icon: icon,
})
</script>
