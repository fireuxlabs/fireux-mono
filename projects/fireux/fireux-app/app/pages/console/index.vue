<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

await navigateTo('/console/project/overview', { replace: true })
</script>
