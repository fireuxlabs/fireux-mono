<template>
  <button
    type="button"
    :aria-pressed="selected"
    class="flex w-full min-w-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="selected ? 'bg-elevated text-highlighted' : 'text-default'"
    @click="$emit('select')"
  >
    <slot />
  </button>
</template>
<script setup lang="ts">
defineProps<{ selected: boolean }>()
defineEmits<{ select: [] }>()
</script>
