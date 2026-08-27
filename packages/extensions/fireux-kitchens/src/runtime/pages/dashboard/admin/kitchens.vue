<template>
  <DashboardAdminDomainCurationPanel
    domain="kitchen"
    title="Kitchens"
    description="Add comma-separated kitchen slugs to feature on public kitchen surfaces."
    placeholder="la-tapberne, luna-piccante"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'kitchens',
    domain: 'kitchens',
    label: 'Kitchens',
    description: 'Feature kitchen slugs on public kitchen surfaces.',
    icon: 'i-lucide-chef-hat',
    order: 100,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
