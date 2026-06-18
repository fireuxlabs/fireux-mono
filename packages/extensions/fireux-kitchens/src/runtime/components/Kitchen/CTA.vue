<template>
  <ConsoleCta
    title="Kitchens"
    description="Find kitchens, open their console, and manage menus, dishes, recipes, ingredients, team, and suppliers."
    :count-label="countLabel"
    :actions="actions"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ count?: number }>()

const actions = [
  {
    label: 'Create',
    cta: 'Create kitchen',
    to: '/kitchens/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Console',
    cta: 'Open console',
    to: '/console/kitchen',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/kitchens/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const

const countLabel = computed(() => {
  if (typeof props.count !== 'number') return undefined
  return `${props.count} kitchen${props.count === 1 ? '' : 's'}`
})
</script>
