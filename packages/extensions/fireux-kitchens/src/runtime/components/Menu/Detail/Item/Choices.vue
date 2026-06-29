<template>
  <div
    v-if="options.length"
    class="menu-item__choices"
    :aria-label="label"
  >
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
  </div>
</template>

<script setup lang="ts">
import type {
  MenuFoodAddOn,
  MenuFoodPriceOption,
} from '../../../../models/menu/menu-food.model'

withDefaults(
  defineProps<{
    label: string
    options?: Array<MenuFoodAddOn | MenuFoodPriceOption>
    selectedIds?: string[]
    prefix?: string
  }>(),
  {
    options: () => [],
    selectedIds: () => [],
    prefix: '',
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
  gap: 0.4rem;
  padding-top: 0.25rem;
}

.menu-item__choice {
  display: inline-flex;
  gap: 0.28rem;
  align-items: center;
  padding: 0.32rem 0.52rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 22%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-primary) 5%, transparent);
  color: var(--menu-primary);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 850;
}

.menu-item__choice small {
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: 800;
}

.menu-item__choice--selected {
  border-color: var(--menu-primary);
  background: color-mix(in srgb, var(--menu-primary) 14%, transparent);
}
</style>
