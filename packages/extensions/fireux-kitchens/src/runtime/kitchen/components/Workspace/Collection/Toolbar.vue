<template>
  <div class="grid min-w-0 gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        :placeholder="`Search ${label}`"
        :aria-label="`Search ${label}`"
        class="min-w-48 flex-1"
      />
      <span role="status" class="text-sm tabular-nums text-muted"
        >{{ count }} {{ count === 1 ? singular : label }}</span
      >
      <slot name="controls" />
    </div>
    <div v-if="$slots.filters" class="flex flex-wrap items-center gap-2">
      <slot name="filters" />
    </div>
  </div>
</template>
<script setup lang="ts">
const query = defineModel<string>({ required: true })
defineProps<{ label: string; singular: string; count: number }>()
</script>
