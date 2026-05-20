<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    hidden: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

await navigateTo('/dashboard/console', { replace: true })
</script>
