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
import { getRouteMetaForPath } from '../../composables/app/routes/useAppUserRoutes'

const { label, icon } = getRouteMetaForPath('/admin')

definePageMeta({
  layout: 'dashboard',
  layoutProps: { dashboardType: 'admin-dashboard' },
  title: label,
  icon: icon,
})
</script>
