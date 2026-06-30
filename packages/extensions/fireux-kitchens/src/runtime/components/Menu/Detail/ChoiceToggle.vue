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
        :aria-label="option.label"
      >
        {{ option.label }}
      </NuxtLink>

      <button
        v-else
        type="button"
        :class="['menu-mode__button', { 'is-active': modelValue === option.value }]"
        :aria-pressed="modelValue === option.value"
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
} from '../../../composables/fireux/menu/useMenuViewMode'

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
  display: inline-grid;
  grid-auto-columns: minmax(7rem, 1fr);
  grid-auto-flow: column;
  gap: 0.3rem;
  width: min(100%, 32rem);
  padding: 0.32rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 1.15rem;
  background: color-mix(in srgb, var(--menu-bg) 88%, var(--menu-text));
}

.menu-mode__button {
  appearance: none;
  display: inline-flex;
  min-height: 2.65rem;
  align-items: center;
  justify-content: center;
  padding: 0.58rem 0.95rem;
  border: 0;
  border-radius: 0.88rem;
  background: transparent;
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 850;
  letter-spacing: 0.02em;
  text-decoration: none;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.menu-mode__button:hover {
  background: color-mix(in srgb, var(--menu-text) 8%, transparent);
}

.menu-mode__button.is-active {
  background: var(--menu-text);
  color: var(--menu-bg);
  transform: translateY(-1px);
}

@media (max-width: 520px) {
  .menu-mode {
    grid-auto-columns: 1fr;
    width: 100%;
  }
}
</style>
