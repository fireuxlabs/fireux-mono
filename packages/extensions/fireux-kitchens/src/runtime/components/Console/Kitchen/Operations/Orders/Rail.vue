<template>
  <section
    class="grid min-w-0 content-start gap-3 rounded-lg border bg-elevated/55 p-3"
    :class="railClass"
    :data-order-rail="label.toLowerCase().replace(/\s+/g, '-')"
  >
    <header class="flex min-h-7 items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <span class="size-2 shrink-0 rounded-full" :class="dotClass" aria-hidden="true" />
        <h2 class="m-0 truncate text-sm font-bold text-highlighted">
          {{ label }}
        </h2>
      </div>

      <span class="tabular-nums text-sm font-bold text-muted">
        {{ count }}
      </span>
    </header>

    <div v-if="count" class="grid min-w-0 gap-2">
      <slot />
    </div>

    <p
      v-else
      class="m-0 grid min-h-20 place-items-center rounded-md border border-dashed border-default px-3 text-center text-xs text-dimmed"
    >
      {{ emptyLabel }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  accent?: 'neutral' | 'primary' | 'success' | 'warning'
  count: number
  emptyLabel: string
  label: string
}>(), {
  accent: 'neutral',
})

const railClass = computed(() => ({
  neutral: 'border-default',
  primary: 'border-primary/30',
  success: 'border-success/30',
  warning: 'border-warning/40',
}[props.accent]))
const dotClass = computed(() => ({
  neutral: 'bg-muted',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
}[props.accent]))
</script>
