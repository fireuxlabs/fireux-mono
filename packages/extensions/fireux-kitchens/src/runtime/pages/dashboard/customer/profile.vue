<template>
  <UDashboardPanel id="dashboard-customer-profile">
    <template #header>
      <LayoutsDashboardNavbar title="My orders" />
    </template>

    <template #body>
      <CustomerOrders />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-kitchens'], profiles: ['customer'] },
    key: 'dashboard-customer-profile',
    label: 'My orders',
    icon: 'i-lucide-receipt-text',
    position: 'middle',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'customer',
  },
  requiresAuth: true,
})
</script>
