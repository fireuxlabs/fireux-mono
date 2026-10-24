<template>
  <UDashboardPanel id="workspace-kitchen-recipes">
    <template #header>
      <WorkspaceNavbar title="Recipes">
        <template #right>
          <WorkspaceKitchenAICapabilityInfo capability="recipes" />
        </template>
      </WorkspaceNavbar>
    </template>
    <template #body>
      <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
        <KitchenPrepAndProductionRecipes />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { provideKitchenRecipesContext } from '../../../../../kitchen/composables/workspace/recipes/useKitchenRecipesContext'
provideKitchenRecipesContext()
definePageMeta({
  layout: 'workspace',
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
