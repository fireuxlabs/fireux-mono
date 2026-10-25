<template>
  <FireDashboardAdminDomainCurationPanel
    domain="chef"
    title="Chefs"
    description="Add comma-separated chef slugs to feature on public chef surfaces."
    placeholder="gino, luna"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'chefs',
    domain: 'chefs',
    label: 'Chefs',
    description: 'Feature chef slugs on public chef surfaces.',
    icon: 'i-lucide-egg-fried',
    order: 130,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
