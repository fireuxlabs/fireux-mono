<template>
  <WorkspaceKitchenAICapabilityInfo capability="ingredients" />
  <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <KitchenPrepAndProductionIngredients />
  </div>
</template>

<script setup lang="ts">
import { provideKitchenIngredientsContext } from '../../../../../kitchen/composables/workspace/ingredients/useKitchenIngredientsContext'

provideKitchenIngredientsContext()

definePageMeta({
  layout: false,
  workspacePage: true,
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
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
