<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: Driver public identity and app-private operations. -->
<template>
  <UDashboardPanel id="dashboard-driver-home">
    <template #header>
      <FireLayoutsDashboardNavbar title="Driver" />
    </template>

    <template #body>
      <DriverDeliveryPings />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-kitchens'], profiles: ['driver'] },
    key: 'dashboard-driver-home',
    label: 'Deliveries',
    icon: 'i-lucide-car',
    position: 'middle',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'driver',
  },
  requiresAuth: true,
})
</script>
