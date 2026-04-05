<template>
  <div class="fx-segmented-toggle">
    <div v-if="label" class="fx-segmented-toggle__label">
      {{ label }}
    </div>

    <div class="fx-segmented-toggle__group">
      <UButton
        v-for="option in options"
        :key="option.value"
        size="xs"
        :color="modelValue === option.value ? 'primary' : 'neutral'"
        :variant="modelValue === option.value ? 'solid' : 'ghost'"
        :aria-pressed="modelValue === option.value"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
type ToggleValue = string
type ToggleOption = {
  readonly value: ToggleValue
  readonly label: string
}

withDefaults(defineProps<{
  modelValue: ToggleValue
  options: ReadonlyArray<ToggleOption>
  label?: string
}>(), {
  label: '',
})

defineEmits<{
  (event: 'update:modelValue', value: ToggleValue): void
}>()
</script>

<style scoped>
.fx-segmented-toggle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.fx-segmented-toggle__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}

.fx-segmented-toggle__group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--ui-bg) 60%, transparent);
}
</style>
