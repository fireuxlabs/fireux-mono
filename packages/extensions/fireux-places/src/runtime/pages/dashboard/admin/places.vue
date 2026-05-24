<template>
  <AdminDomainCurationPanel
    domain="place"
    title="Places"
    description="Add comma-separated place slugs to feature on public place surfaces."
    placeholder="local-cafe, train-station"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'places',
    domain: 'places',
    label: 'Places',
    description: 'Feature place slugs on public place surfaces.',
    icon: 'i-lucide-map-pin',
    order: 190,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
