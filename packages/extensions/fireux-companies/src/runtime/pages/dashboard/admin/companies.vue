<template>
  <AdminDomainCurationPanel
    domain="company"
    title="Companies"
    description="Add comma-separated company slugs to feature on public company surfaces."
    placeholder="acme, local-supplier"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'companies',
    domain: 'companies',
    label: 'Companies',
    description: 'Feature company slugs on public company surfaces.',
    icon: 'i-lucide-landmark',
    order: 200,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
