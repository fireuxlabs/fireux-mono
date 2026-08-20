<template>
  <UAlert
    color="neutral"
    variant="soft"
    :title="alertTitle"
    :description="description"
  />
</template>

<script setup lang="ts">
// Workspace sundries quarantine: docs/concepts/workspace.md
defineProps<{
  alertTitle: string
  description: string
}>()
</script>
