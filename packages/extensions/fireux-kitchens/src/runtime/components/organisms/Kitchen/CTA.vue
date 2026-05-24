<template>
  <EntityIndexCta
    title="Kitchens index"
    description="Kitchens are console workspaces. Select a kitchen, then manage menus, dishes, recipes, ingredients, mise, team, and suppliers in the kitchen console."
    family="console"
    source="kitchens collection"
    :count-label="`${count} kitchen${count === 1 ? '' : 's'}`"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), {
  count: 0,
})

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

const count = props.count
</script>
