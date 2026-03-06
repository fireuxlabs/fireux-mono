<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

await navigateTo('/console/supplier/overview', { replace: true })
</script>
