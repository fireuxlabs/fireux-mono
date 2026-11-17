<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    hidden: true,
    menus: ['dashboard'],
  },
  requiresAuth: true,
})

await navigateTo('/dashboard/workspace', { replace: true })
</script>
