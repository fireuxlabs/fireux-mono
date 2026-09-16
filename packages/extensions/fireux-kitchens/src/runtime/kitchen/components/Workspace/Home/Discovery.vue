<template>
  <section class="space-y-3 pt-4" aria-label="Kitchen tools">
    <h2 class="text-base font-semibold">
      {{
        selected ? 'Get straight to work' : 'Explore what your Kitchen can do'
      }}
    </h2>
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
defineProps<{ selected: boolean }>()
const cards = [
  {
    title: 'Menus',
    description: 'Dishes, prices and what your guests see.',
    icon: 'i-lucide-notebook-text',
    capability: 'menus',
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
    capability: 'recipes',
    to: '/operations/recipes',
  },
  {
    title: 'Explore Kitchens',
    description: 'Published venues and their menus.',
    icon: 'i-lucide-map',
    capability: '',
    to: '/kitchens',
  },
]
</script>

<style scoped>
.landing-tool-card {
  aspect-ratio: 1;
  min-height: 11rem;
}
</style>
