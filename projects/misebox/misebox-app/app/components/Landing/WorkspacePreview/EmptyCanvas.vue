<template>
  <div :aria-label="`${title} page canvas`" />
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
