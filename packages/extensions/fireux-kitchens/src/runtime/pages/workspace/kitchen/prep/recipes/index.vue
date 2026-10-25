<template>
  <WorkspaceKitchenAICapabilityInfo capability="recipes" />
  <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <KitchenPrepAndProductionRecipes />
  </div>
</template>

<script setup lang="ts">
import { provideKitchenRecipesContext } from '../../../../../kitchen/composables/workspace/recipes/useKitchenRecipesContext'
provideKitchenRecipesContext()
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-recipes',
    label: 'Recipes',
    group: 'Prep & Production',
    hidden: true,
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-cooking-pot',
    icon: 'i-lucide-notebook-tabs',
    position: 'top',
    order: 32,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
