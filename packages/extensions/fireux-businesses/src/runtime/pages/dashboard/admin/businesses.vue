<template>
  <FireDashboardAdminDomainCurationPanel
    domain="business"
    title="Businesses"
    description="Add comma-separated business slugs to feature on public business surfaces."
    placeholder="acme, local-supplier"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'businesses',
    domain: 'businesses',
    label: 'Businesses',
    description: 'Feature business slugs on public business surfaces.',
    icon: 'i-lucide-landmark',
    order: 200,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
