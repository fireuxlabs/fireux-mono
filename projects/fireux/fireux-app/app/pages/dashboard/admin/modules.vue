<template>
  <AdminDomainCurationPanel
    domain="module"
    title="Modules"
    description="Add comma-separated module slugs to feature on public module surfaces."
    placeholder="fireux-products, fireux-blogs"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'modules',
    label: 'Modules',
    description: 'Feature module slugs on public module surfaces.',
    icon: 'i-lucide-puzzle',
    order: 60,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
