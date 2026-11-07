<template>
  <div class="workspace-surface__grid">
    <div>
      <UInput
        v-model="query"
        icon="i-lucide-search"
        :placeholder="`Search ${label}`"
        :aria-label="`Search ${label}`"
      />
      <span role="status"
        >{{ count }} {{ count === 1 ? singular : label }}</span
      >
      <slot name="controls" />
    </div>
    <div v-if="$slots.filters">
      <slot name="filters" />
    </div>
  </div>
</template>
<script setup lang="ts">
const query = defineModel<string>({ required: true })
defineProps<{ label: string; singular: string; count: number }>()
</script>
