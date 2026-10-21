<template>
  <KitchenFoodAndDrink />
</template>

<script setup lang="ts">
import KitchenFoodAndDrink from '../../../../kitchen/components/FoodAndDrink/Index.vue'
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-food',
    label: 'Food & drink',
    description:
      'Manage what you sell, how it is presented and where it is available.',
    group: '',
    groupIndex: true,
    icon: 'i-lucide-utensils',
    position: 'top',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        key: 'items',
        label: 'Items',
        to: '/workspace/kitchen/food-and-drink/items',
        icon: 'i-lucide-carrot',
      },
      {
        key: 'menus',
        label: 'Menus',
        to: '/workspace/kitchen/food-and-drink/menus',
        icon: 'i-lucide-book-open',
      },
      {
        key: 'promotions',
        label: 'Promotions',
        to: '/workspace/kitchen/food-and-drink/promotions',
        icon: 'i-lucide-tags',
      },
      {
        key: 'services',
        label: 'Services',
        to: '/workspace/kitchen/food-and-drink/services',
        icon: 'i-lucide-shopping-bag',
      },
    ],
  },
})
</script>
