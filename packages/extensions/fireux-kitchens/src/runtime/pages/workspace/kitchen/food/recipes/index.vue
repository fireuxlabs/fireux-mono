<template>
  <UDashboardPanel id="workspace-kitchen-recipes">
    <template #header>
      <LayoutsWorkspaceNavbar title="Recipes">
        <template #right>
          <WorkspaceKitchenAICapabilityInfo capability="recipes" />
        </template>
      </LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
        <WorkspaceKitchenRecipes />
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
    group: 'Menus & Recipes',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-utensils',
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
