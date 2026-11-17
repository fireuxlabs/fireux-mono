<template>
  <NuxtPage />
</template>

<script setup>
definePageMeta({
  layout: 'workspace',

  requiresAuth: true,
  requiresSelection: true,
})
</script>
