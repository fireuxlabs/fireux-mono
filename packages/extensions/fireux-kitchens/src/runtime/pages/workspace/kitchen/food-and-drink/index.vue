<template>
  <KitchenFoodAndDrink />
</template>

<script setup lang="ts">
import KitchenFoodAndDrink from '../../../../kitchen/components/FoodAndDrink/Index.vue'
definePageMeta({
  layout: false,
  workspacePage: true,
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
      'Manage items, menus, promotions and services and some collective stuff.',
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
        icon: 'i-lucide-hamburger',
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
