<template>
  <AdminDomainCurationPanel
    domain="job"
    title="Jobs"
    description="Add comma-separated job slugs to feature on public job surfaces."
    placeholder="head-chef, sous-chef"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'jobs',
    domain: 'jobs',
    label: 'Jobs',
    description: 'Feature job slugs on public job surfaces.',
    icon: 'i-lucide-briefcase-business',
    order: 120,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
