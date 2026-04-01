<template>
  <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-3">
    <div class="min-w-0">
      <h1 class="truncate text-sm font-semibold text-highlighted">{{ title }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  ui?: any
}>()
</script>
