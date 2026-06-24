<template>
  <div v-if="options.length > 1" class="menu-mode">
    <template
      v-for="option in options"
      :key="option.value"
    >
      <NuxtLink
        v-if="option.to"
        :to="option.to"
        class="menu-mode__button"
      >
        {{ option.label }}
      </NuxtLink>

      <button
        v-else
        type="button"
        :class="['menu-mode__button', { 'is-active': modelValue === option.value }]"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import type {
  MenuChoiceOption,
  MenuChoiceValue,
} from '../../../composables/fireux/public/menu/useMenuViewMode'

withDefaults(
  defineProps<{
    modelValue: MenuChoiceValue
    options?: MenuChoiceOption[]
  }>(),
  {
    options: () => [],
  }
)

defineEmits<{
  (event: 'update:modelValue', value: MenuChoiceValue): void
}>()
</script>

<style scoped>
.menu-mode {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 22%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-primary) 8%, transparent);
}

.menu-mode__button {
  appearance: none;
  padding: 0.48rem 0.9rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--menu-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 850;
}

.menu-mode__button.is-active {
  background: var(--menu-primary);
  color: var(--menu-bg);
}
</style>
