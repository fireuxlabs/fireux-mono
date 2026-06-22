<template>
  <div v-if="options.length > 1" class="menu-mode">
    <button
      v-if="options.includes('classic')"
      type="button"
      :class="['menu-mode__button', { 'is-active': modelValue === 'classic' }]"
      @click="$emit('update:modelValue', 'classic')"
    >
      Classic
    </button>
    <button
      v-if="options.includes('order')"
      type="button"
      :class="['menu-mode__button', { 'is-active': modelValue === 'order' }]"
      @click="$emit('update:modelValue', 'order')"
    >
      Order
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MenuPublicView } from '../../../models/menu/menu.model'

withDefaults(
  defineProps<{
    modelValue: MenuPublicView
    options?: MenuPublicView[]
  }>(),
  {
    options: () => ['classic', 'order'],
  }
)

defineEmits<{
  (event: 'update:modelValue', value: MenuPublicView): void
}>()
</script>

<style scoped>
.menu-mode {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-text) 8%, transparent);
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
  background: var(--menu-title);
  color: var(--menu-bg);
}
</style>
