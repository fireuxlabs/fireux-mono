<template>
  <p class="flex items-start gap-2 px-1 text-xs text-muted">
    <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0" />
    <span
      >Each Test holds one text value in this {{ entityLabel }} workspace. Use
      the info button above for tool details.</span
    >
  </p>
</template>
<script setup lang="ts">
defineProps<{ entityLabel: string }>()
</script>
