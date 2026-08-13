<template>
  <div class="colour">
    <span
      class="colour__swatch"
      :class="{ 'colour__swatch--missing': !value }"
      :style="value ? { backgroundColor: value } : undefined"
      aria-hidden="true"
    />
    <span>
      <small>{{ label }}</small>
      <code v-if="value">{{ value }}</code>
      <strong v-else>Missing</strong>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value?: string }>()
</script>

<style scoped>
.colour { display: flex; align-items: center; gap: calc(var(--spacing) * 3); min-width: 0; }
.colour__swatch { width: calc(var(--spacing) * 10); aspect-ratio: 1; flex: none; border: 1px solid color-mix(in srgb, currentColor 20%, transparent); border-radius: var(--ui-radius); }
.colour__swatch--missing { background: repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, currentColor 9%, transparent) 6px 12px); }
.colour > span:last-child { display: grid; min-width: 0; }
.colour small { color: var(--ui-text-muted); text-transform: capitalize; }
.colour code { overflow-wrap: anywhere; }
.colour strong { color: var(--ui-text-muted); font-size: var(--text-sm); font-weight: var(--font-weight-medium); }
</style>
