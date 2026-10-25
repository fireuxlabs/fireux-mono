<template>
  <WorkspaceKitchenAICapabilityInfo capability="dishes" />
  <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <KitchenFoodAndDrinkItems />
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesContext } from '../../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'
provideKitchenDishesContext('all')

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-dishes',
    label: 'Items',
    group: 'Food & drink',
    description: 'Manage the food and drinks used in your menus.',
    icon: 'i-lucide-utensils',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
