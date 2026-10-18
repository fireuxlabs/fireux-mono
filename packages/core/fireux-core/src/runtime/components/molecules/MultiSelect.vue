<template>
  <div class="flex flex-wrap gap-2" role="group" :aria-label="label">
    <UBadge
      v-for="item in items"
      :key="item.value"
      as="button"
      type="button"
      :label="item.label"
      color="neutral"
      variant="soft"
      :leading-icon="model.includes(item.value) ? 'i-lucide-check' : undefined"
      :aria-pressed="model.includes(item.value)"
      :title="item.description"
      :disabled="disabled || item.disabled"
      size="lg"
      class="multi-select-option cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      @click="toggle(item.value)"
    />
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  label: string
  items: {
    label: string
    value: string
    description?: string
    disabled?: boolean
  }[]
  disabled?: boolean
}>()
const model = defineModel<string[]>({ required: true })
function toggle(value: string) {
  const item = props.items.find((item) => item.value === value)
  if (props.disabled || !item || item.disabled) return
  model.value = model.value.includes(value)
    ? model.value.filter((selected) => selected !== value)
    : [...model.value, value]
}
</script>

<style scoped>
.multi-select-option {
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  color: var(--ui-text-muted);
  background: color-mix(in oklab, var(--ui-bg-elevated) 70%, transparent);
  box-shadow: inset 0 0 0 1px var(--ui-border);
  transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease;
}
.multi-select-option[aria-pressed='true'] {
  color: var(--ui-text-highlighted);
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--ui-primary) 23%, var(--ui-bg)),
    color-mix(in oklab, var(--ui-primary) 12%, var(--ui-bg))
  );
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ui-primary) 45%, transparent);
}
.multi-select-option:hover:not(:disabled) {
  color: var(--ui-text-highlighted);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ui-primary) 65%, var(--ui-border));
}
.multi-select-option:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .multi-select-option {
    transition: none;
  }
}
</style>
