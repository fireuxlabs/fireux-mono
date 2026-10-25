<template>
  <FireDashboardAdminDomainCurationPanel
    domain="professional"
    title="Professionals"
    description="Add comma-separated professional slugs to feature on public professional surfaces."
    placeholder="seo-charlie, chef-gino"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'professionals',
    domain: 'professionals',
    label: 'Professionals',
    description: 'Feature professional slugs on public professional surfaces.',
    icon: 'i-lucide-user-round-check',
    order: 150,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
