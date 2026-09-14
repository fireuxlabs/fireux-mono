<template>
  <DashboardHome
    ><template #workspace><DomainDashboard /></template
  ></DashboardHome>
</template>
<script setup lang="ts">
import DashboardHome from 'fireux-core/runtime/components/Dashboard/Home.vue'
import DomainDashboard from 'fireux-core/runtime/project/components/Workspace/Dashboard.vue'
definePageMeta({
  nav: {
    key: 'dashboard-home',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})
useHead({ title: 'Overview' })
</script>
