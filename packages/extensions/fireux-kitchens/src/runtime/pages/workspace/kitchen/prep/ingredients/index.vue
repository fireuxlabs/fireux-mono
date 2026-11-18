<template>
  <div>
    <KitchenWorkspacePrepIngredients />
  </div>
</template>

<script setup lang="ts">
import { provideKitchenIngredientsContext } from '../../../../../kitchen/composables/workspace/ingredients/useKitchenIngredientsContext'

provideKitchenIngredientsContext()

definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-ingredients',
    label: 'Ingredients',
    group: 'Prep & Production',
    hidden: true,
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-cooking-pot',
    icon: 'i-lucide-carrot',
    position: 'top',
    order: 33,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
