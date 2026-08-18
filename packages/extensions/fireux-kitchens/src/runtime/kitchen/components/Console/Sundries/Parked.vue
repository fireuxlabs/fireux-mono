<template>
  <UAlert
    color="neutral"
    variant="soft"
    :title="alertTitle"
    :description="description"
  />
</template>

<script setup lang="ts">
// Console sundries quarantine: docs/concepts/console.md
defineProps<{
  alertTitle: string
  description: string
}>()
</script>
