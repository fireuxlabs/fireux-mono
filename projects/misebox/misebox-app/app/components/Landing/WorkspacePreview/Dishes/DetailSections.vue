<template>
  <UCard>
    <img v-if="dish.imageUrl" :src="dish.imageUrl" alt="" />
    <div v-else aria-hidden="true">
      <UIcon name="i-lucide-utensils" />
    </div>
    <div aria-hidden="true" />

    <nav aria-label="Dish detail sections">
      <UButton
        v-for="section in sectionItems"
        :key="section.id"
        type="button"
        :icon="section.icon"
        :color="section.id === selected ? 'primary' : 'neutral'"
        :variant="section.id === selected ? 'soft' : 'outline'"
        :aria-label="section.label"
        :aria-current="section.id === selected ? 'page' : undefined"
        :title="`${section.label}: ${section.summary}`"
        @click="$emit('select', section.id)"
      />
    </nav>
  </UCard>
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
])
</script>
