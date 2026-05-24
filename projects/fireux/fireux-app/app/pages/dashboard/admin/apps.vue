<template>
  <AdminDomainCurationPanel
    domain="app"
    title="Apps"
    description="Add comma-separated app slugs to feature on public app surfaces."
    placeholder="go-qr, sproochli, buenohost"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'apps',
    label: 'Apps',
    description: 'Feature app slugs on public app surfaces.',
    icon: 'i-lucide-app-window',
    order: 30,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
