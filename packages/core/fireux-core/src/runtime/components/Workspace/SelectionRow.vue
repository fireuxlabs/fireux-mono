<template>
  <button
    type="button"
    :aria-pressed="selected"
    class="workspace-selection-row"
    :class="{ 'workspace-selection-row--selected': selected }"
    @click="$emit('select')"
  >
    <slot />
  </button>
</template>
<script setup lang="ts">
defineProps<{ selected: boolean }>()
defineEmits<{ select: [] }>()
</script>

<style scoped>
.workspace-selection-row {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  border-radius: calc(var(--ui-radius) * 2);
  border-inline-start: calc(var(--spacing) * 0.75) solid transparent;
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  text-align: start;
  font-size: var(--text-sm);
  color: var(--ui-text);
}
.workspace-selection-row:hover {
  background: var(--ui-bg-elevated);
}
.workspace-selection-row--selected {
  border-inline-start-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
  color: var(--ui-text-highlighted);
}
.workspace-selection-row:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}
</style>
