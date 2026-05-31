<template>
  <ErrorPage :error="error" />
</template>

<script setup lang="ts">
defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()
</script>
