<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'granite-console',
  requiresAuth: true,
})

await navigateTo('/console/portfolio/overview', { replace: true })
</script>
