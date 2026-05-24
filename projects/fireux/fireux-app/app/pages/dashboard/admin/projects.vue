<template>
  <AdminDomainCurationPanel
    domain="project"
    title="Projects"
    description="Add comma-separated project slugs to feature on public project surfaces."
    placeholder="my-project, launch-stack"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'projects',
    domain: 'projects',
    label: 'Projects',
    description: 'Feature project slugs on public project surfaces.',
    icon: 'i-lucide-folders',
    order: 50,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
