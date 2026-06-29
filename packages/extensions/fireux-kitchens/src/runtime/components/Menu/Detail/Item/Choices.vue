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
