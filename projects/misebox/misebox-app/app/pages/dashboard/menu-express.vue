<template>
  <UPage>
    <UPageHeader title="Menu Express delivery queue" />
    <UPageBody><MenuExpressOperator /></UPageBody>
  </UPage>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Menu Express',
  layout: 'dashboard',
  requiresAuth: true,
  roles: ['admin', 'dev'],
  nav: {
    key: 'misebox-menu-express',
    label: 'Menu Express',
    icon: 'i-lucide-clipboard-list',
    position: 'middle',
    order: 12,
    desktop: true,
    layouts: ['dashboard'],
  },
})
useSeoMeta({
  title: 'Menu Express delivery · Misebox',
  robots: 'noindex, nofollow',
})
</script>
