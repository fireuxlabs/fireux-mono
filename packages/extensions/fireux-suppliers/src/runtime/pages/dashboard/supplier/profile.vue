<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
})

await navigateTo('/dashboard/supplier/manage', { replace: true })
</script>
