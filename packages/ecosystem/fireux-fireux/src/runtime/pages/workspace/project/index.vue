<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  pageTransition: false,
  requiresAuth: true,
  requiresSelection: false,
})

await navigateTo('/', { replace: true })
</script>
