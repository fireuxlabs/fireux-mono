<template>
  <AdminDomainCurationPanel
    domain="ingredient"
    title="Ingredients"
    description="Add comma-separated ingredient slugs to feature on public ingredient surfaces."
    placeholder="tomatoes, basil"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'ingredients',
    domain: 'ingredients',
    label: 'Ingredients',
    description: 'Feature ingredient slugs on public ingredient surfaces.',
    icon: 'i-lucide-carrot',
    order: 140,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
