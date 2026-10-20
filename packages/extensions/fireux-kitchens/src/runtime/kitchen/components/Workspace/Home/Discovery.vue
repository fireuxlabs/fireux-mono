<template>
  <section class="pt-4" aria-label="Kitchen tools">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <UPageCard
        v-for="card in cards"
        :key="card.title"
        :title="card.title"
        :description="card.description"
        :icon="card.icon"
        :to="
          selected && card.capability
            ? `/workspace/kitchen/${card.capability}`
            : card.to
        "
        variant="subtle"
        class="landing-tool-card"
        :ui="{
          container: 'h-full justify-between p-4 sm:p-5',
          leadingIcon: 'size-7',
          description: 'text-sm',
        }"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ selected: boolean }>()
const cards = computed(() => [
  {
    title: 'Menus',
    description: 'Dishes, prices and what your guests see.',
    icon: 'i-lucide-notebook-text',
    capability: 'food-and-drink/menus',
    to: '/operations/menus',
  },
  {
    title: 'Orders',
    description: 'From a guest’s choice to kitchen fulfilment.',
    icon: 'i-lucide-receipt-text',
    capability: 'orders',
    to: '/operations/orders',
  },
  {
    title: 'Recipes',
    description: 'A consistent way to prepare your food.',
    icon: 'i-lucide-book-open',
    capability: 'prep/recipes',
    to: '/operations/recipes',
  },
  {
    title: props.selected ? 'Team' : 'Explore Kitchens',
    description: props.selected
      ? 'People and responsibilities.'
      : 'Published venues and their menus.',
    icon: props.selected ? 'i-lucide-users' : 'i-lucide-map',
    capability: 'team',
    to: '/kitchens',
  },
])
</script>

<style scoped>
.landing-tool-card {
  min-height: 8rem;
}
</style>
