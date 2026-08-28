<template>
  <div
    class="relative mb-3 min-h-28 overflow-hidden rounded-xl border border-default bg-elevated shadow-sm"
  >
    <img
      v-if="dish.imageUrl"
      :src="dish.imageUrl"
      alt=""
      class="absolute inset-0 size-full object-cover"
    />
    <div
      v-else
      class="absolute inset-0 flex items-center justify-center text-muted"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-utensils" class="size-9" />
    </div>
    <div class="absolute inset-0 bg-default/40" aria-hidden="true" />

    <nav
      class="relative flex min-h-28 flex-wrap items-end gap-1.5 p-3"
      aria-label="Dish detail sections"
    >
      <button
        v-for="section in sectionItems"
        :key="section.id"
        type="button"
        class="flex size-9 shrink-0 items-center justify-center rounded-md border text-toned shadow-sm transition-colors hover:bg-default/90 hover:text-highlighted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="
          section.id === selected
            ? 'border-primary bg-default/90 text-primary ring-1 ring-primary/20'
            : 'border-default/80 bg-default/70'
        "
        :aria-label="section.label"
        :aria-current="section.id === selected ? 'page' : undefined"
        :title="`${section.label}: ${section.summary}`"
        @click="$emit('select', section.id)"
      >
        <UIcon :name="section.icon" class="size-4" aria-hidden="true" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DishChildPage, ProductDemoDish } from './types'

const props = defineProps<{
  dish: ProductDemoDish
  selected: DishChildPage
}>()

defineEmits<{
  (event: 'select', page: DishChildPage): void
}>()

const sectionItems = computed(() => [
  {
    id: 'detail' as const,
    icon: 'i-lucide-info',
    label: 'Dish overview',
    summary: props.dish.name,
  },
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
