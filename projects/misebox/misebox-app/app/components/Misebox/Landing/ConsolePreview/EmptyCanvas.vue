<template>
  <div
    class="mt-5 min-h-[20rem] rounded-xl border border-dashed border-default bg-elevated/20"
    :aria-label="`${title} page canvas`"
  />
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
