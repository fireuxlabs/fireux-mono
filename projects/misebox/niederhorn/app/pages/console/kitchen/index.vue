<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

definePageMeta({
  layout: 'kitchen-console',
  requiresAuth: true,
})

await navigateTo('/console/kitchen/overview', { replace: true })
</script>
