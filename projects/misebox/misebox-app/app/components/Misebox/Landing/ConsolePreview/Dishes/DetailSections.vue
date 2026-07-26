<template>
  <div
    class="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-5"
    aria-label="Dish detail sections"
  >
    <button
      v-for="section in sectionItems"
      :key="section.id"
      type="button"
      class="flex min-w-0 items-center justify-center gap-1 rounded-md border border-default bg-elevated/40 px-1.5 py-1.5 text-xs font-semibold text-toned transition-colors hover:bg-elevated hover:text-highlighted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :title="`${section.label}: ${section.summary}`"
      @click="$emit('select', section.id)"
    >
      <UIcon :name="section.icon" class="size-3.5 shrink-0" />
      <span class="truncate">{{ section.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DishChildPage, ProductDemoDish } from './types'

const props = defineProps<{
  dish: ProductDemoDish
}>()

defineEmits<{
  (event: 'select', page: Exclude<DishChildPage, 'detail'>): void
}>()

const sectionItems = computed(() => [
  {
    id: 'finance' as const,
    icon: 'i-lucide-chart-no-axes-column',
    label: 'Finance',
    summary: props.dish.priceLabel || 'Not priced',
  },
  {
    id: 'spec' as const,
    icon: 'i-lucide-clipboard-list',
    label: 'Spec',
    summary: props.dish.spec.station || 'No spec',
  },
  {
    id: 'prep' as const,
    icon: 'i-lucide-list-checks',
    label: 'Prep items',
    summary: `${props.dish.prepItems.length} items`,
  },
  {
    id: 'recipes' as const,
    icon: 'i-lucide-notebook-tabs',
    label: 'Recipes',
    summary: `${props.dish.recipes.length} recipes`,
  },
  {
    id: 'mise' as const,
    icon: 'i-lucide-chef-hat',
    label: 'Mise en place',
    summary: `${props.dish.mise.length} requirements`,
  },
])
</script>
