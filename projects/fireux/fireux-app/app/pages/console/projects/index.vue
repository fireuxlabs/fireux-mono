<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

await navigateTo('/console/projects/overview', { replace: true })
</script>
