<template>
  <KitchenFoodAndDrink />
</template>

<script setup lang="ts">
import KitchenFoodAndDrink from '../../../../kitchen/components/FoodAndDrink/Index.vue'
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceHeader: 'content',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-food',
    label: 'Menus',
    group: '',
    groupIndex: true,
    icon: 'i-lucide-book-open',
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
