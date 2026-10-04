<template>
  <UDashboardPanel id="user-profile">
    <template #header><LayoutsDashboardNavbar title="Account" /></template>
    <template #body><AccountProfile /></template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  nav: {
    key: 'dashboard-user-profile',
    label: 'Account',
    icon: 'i-lucide-user',
    position: 'top',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
})
useHead({
  title: 'Account',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})
</script>
