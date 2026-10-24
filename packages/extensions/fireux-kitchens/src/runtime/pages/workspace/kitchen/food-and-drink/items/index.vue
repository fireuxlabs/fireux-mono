<template>
  <UDashboardPanel id="workspace-kitchen-dishes">
    <template #header>
      <WorkspaceNavbar title="Items">
        <template #right>
          <WorkspaceKitchenAICapabilityInfo capability="dishes" />
        </template>
      </WorkspaceNavbar>
    </template>
    <template #body>
      <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
        <KitchenFoodAndDrinkItems />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { provideKitchenDishesContext } from '../../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'
provideKitchenDishesContext('all')

definePageMeta({
  layout: 'workspace',
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
