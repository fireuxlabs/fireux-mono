<template>
  <DashboardAdminDomainCurationPanel
    domain="supplier"
    title="Suppliers"
    description="Add comma-separated supplier slugs to feature on public supplier surfaces."
    placeholder="local-farm, fresh-fish"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'suppliers',
    domain: 'suppliers',
    label: 'Suppliers',
    description: 'Feature supplier slugs on public supplier surfaces.',
    icon: 'i-lucide-truck',
    order: 110,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
