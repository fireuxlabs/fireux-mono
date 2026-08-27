<template>
  <DashboardAdminDomainCurationPanel
    domain="portfolio"
    title="Portfolios"
    description="Add comma-separated portfolio slugs to feature on public portfolio surfaces."
    placeholder="city-flats, mountain-homes"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'portfolios',
    domain: 'portfolios',
    label: 'Portfolios',
    description: 'Feature portfolio slugs on public portfolio surfaces.',
    icon: 'i-lucide-building-2',
    order: 180,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
