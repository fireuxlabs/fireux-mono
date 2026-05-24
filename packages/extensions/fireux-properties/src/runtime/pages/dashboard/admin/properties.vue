<template>
  <AdminDomainCurationPanel
    domain="property"
    title="Properties"
    description="Add comma-separated property slugs to feature on public property surfaces."
    placeholder="holiday-with-nats, alpine-studio"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'properties',
    domain: 'properties',
    label: 'Properties',
    description: 'Feature property slugs on public property surfaces.',
    icon: 'i-lucide-house',
    order: 170,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
