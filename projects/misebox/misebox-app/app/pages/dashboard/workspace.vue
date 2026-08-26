<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-workspace',
    label: 'Workspace',
    icon: 'i-lucide-square-terminal',
    position: 'middle',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})

await navigateTo('/', { replace: true })
</script>
