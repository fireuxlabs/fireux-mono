<template>
  <AdminDomainCurationPanel
    domain="ecosystem"
    title="Ecosystems"
    description="Add comma-separated ecosystem slugs to feature on public ecosystem surfaces."
    placeholder="fireux, misebox, cleanbox"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'ecosystems',
    label: 'Ecosystems',
    description: 'Feature ecosystem slugs on public ecosystem surfaces.',
    icon: 'i-lucide-orbit',
    order: 40,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
