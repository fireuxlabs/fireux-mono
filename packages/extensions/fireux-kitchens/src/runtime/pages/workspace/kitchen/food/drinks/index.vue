<template>
  <UDashboardPanel id="workspace-kitchen-drinks">
    <template #header>
      <LayoutsWorkspaceNavbar title="Food &amp; drinks">
        <template #right>
          <WorkspaceKitchenAICapabilityInfo capability="dishes" />
        </template>
      </LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
        <WorkspaceKitchenDishes />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { provideKitchenDishesContext } from '../../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'
provideKitchenDishesContext('drink')

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-drinks',
    label: 'Drinks',
    group: 'Menus & Recipes',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-glass-water',
    position: 'top',
    order: 12,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    hidden: true,
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
