<template>
  <div v-if="options.length" class="menu-item__choices" :aria-label="label">
    <template v-if="interactive">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        :class="[
          'menu-item__choice',
          selectedIds.includes(option.id) && 'menu-item__choice--selected',
        ]"
        @click="$emit('toggle', option.id)"
      >
        <span>{{ prefix }}{{ option.label }}</span>
        <small v-if="option.priceLabel">{{ option.priceLabel }}</small>
      </button>
    </template>

    <template v-else>
      <span
        v-for="option in options"
        :key="option.id"
        class="menu-item__choice menu-item__choice--read-only"
      >
        <span>{{ prefix }}{{ option.label }}</span>
        <small v-if="option.priceLabel">{{ option.priceLabel }}</small>
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import type {
  MenuFoodAddOn,
  MenuFoodPriceOption,
} from '../../models/menu-food.model.ts'

withDefaults(
  defineProps<{
    label: string
    options?: Array<MenuFoodAddOn | MenuFoodPriceOption>
    selectedIds?: string[]
    prefix?: string
    interactive?: boolean
  }>(),
  {
    options: () => [],
    selectedIds: () => [],
    prefix: '',
    interactive: true,
  }
)

defineEmits<{
  (event: 'toggle', id: string): void
}>()
</script>

<style scoped>
.menu-item__choices {
  display: flex;
  flex-wrap: wrap;
  gap: var(--menu-space-xs);
  padding-top: var(--menu-space-2xs);
}

.menu-item__choice {
  display: inline-flex;
  gap: var(--menu-space-2xs);
  align-items: center;
  padding: var(--menu-space-xs) var(--menu-space-sm);
  border: 1px solid color-mix(in srgb, var(--menu-primary) 22%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-primary) 5%, transparent);
  color: var(--menu-primary);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: var(--font-weight-extrabold);
}

.menu-item__choice small {
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
}

.menu-item__choice--selected {
  border-color: var(--menu-primary);
  background: color-mix(in srgb, var(--menu-primary) 14%, transparent);
}

.menu-item__choice--read-only {
  border-color: color-mix(in srgb, var(--menu-text) 18%, transparent);
  background: color-mix(in srgb, var(--menu-text) 5%, transparent);
  color: var(--menu-text);
  cursor: default;
}
</style>
