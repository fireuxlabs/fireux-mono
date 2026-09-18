<template>
  <div class="recipe-page">
    <UDashboardPanel id="workspace-kitchen-recipes">
      <template #header><LayoutsWorkspaceNavbar title="Recipes" /></template>
      <template #body><WorkspaceKitchenRecipes /></template>
    </UDashboardPanel>
  </div>
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
<style scoped>
.recipe-page {
  flex: 1;
  min-width: 0;
}
</style>
