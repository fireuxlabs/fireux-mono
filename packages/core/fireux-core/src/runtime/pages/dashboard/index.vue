<template>
  <UDashboardPanel id="home">
    <template #header>
      <LayoutsDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <div class="panels-stack">
        <div class="panels-grid-3">
          <DashboardOverviewCore class="dashboard-item" />
          <DashboardOverviewEcosystem class="dashboard-item" />
          <DashboardOverviewApp class="dashboard-item" />
        </div>

        <div class="panels-grid-2">
          <DashboardOverviewDomainEcosystem class="dashboard-item" />
          <DashboardOverviewDomainApp class="dashboard-item" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';

definePageMeta({
  nav: {
    key: 'dashboard-home',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})

</script>
