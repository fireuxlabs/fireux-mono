<template>
  <WorkspaceKitchenAICapabilityInfo capability="dishes" />
  <div>
    <KitchenMenuItems />
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesContext } from '../../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'
import { provideKitchenItemOrganisation } from '../../../../../kitchen/composables/workspace/dishes/useKitchenItemOrganisation'
const context = provideKitchenDishesContext('all')
provideKitchenItemOrganisation(context)

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
    group: 'Menus',
    description: 'Manage the Items used across your Menus.',
    icon: 'i-lucide-sandwich',
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
