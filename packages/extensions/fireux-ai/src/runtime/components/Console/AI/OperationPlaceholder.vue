<template>
  <div
    class="hidden h-9 min-w-52 max-w-80 items-center gap-2 rounded-lg border border-default bg-default px-3 text-sm text-dimmed md:flex"
    role="status"
    :aria-label="placeholder"
  >
    <UIcon name="i-lucide-sparkles" class="size-4 shrink-0 text-primary" />
    <span class="truncate">{{ placeholder }}</span>
  </div>

  <UTooltip :text="placeholder">
    <span
      class="inline-flex size-9 items-center justify-center rounded-lg border border-default bg-default text-primary md:hidden"
      role="status"
      :aria-label="placeholder"
    >
      <UIcon name="i-lucide-sparkles" class="size-4" />
    </span>
  </UTooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ operation: string }>()
const placeholder = computed(() => `Ask about ${props.operation}…`)
</script>
