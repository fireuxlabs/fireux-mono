<template>
  <UPageCard
    v-if="selectedId"
    title="Selected Blank"
    :description="selectedId"
    variant="subtle"
  />
</template>

<script setup lang="ts">
defineProps<{
  selectedId?: string
}>()
</script>
