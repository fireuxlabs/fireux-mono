<template>
  <WorkspaceKitchenAICapabilityInfo capability="menus" />
  <div class="fx-page-stack">
    <KitchenFoodAndDrinkMenus />
  </div>
</template>

<script setup lang="ts">
import { provideKitchenMenusContext } from '../../../../../kitchen/composables/workspace/menus/useKitchenMenusContext'

provideKitchenMenusContext()

definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-menus',
    label: 'Menus',
    group: 'Food & drink',
    description: 'Organise dishes into menus, then publish and share them.',
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
