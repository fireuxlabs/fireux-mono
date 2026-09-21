<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-menus-recipes-overview">
      <template #header
        ><LayoutsWorkspaceNavbar title="Menus & Recipes"
      /></template>
      <template #body><MenusRecipesOverview /></template>
    </UDashboardPanel>
  </div>
</template>
<script setup lang="ts">
import MenusRecipesOverview from '../../../kitchen/components/Workspace/Overview/MenusRecipes.vue'
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-menus-recipes-overview',
    label: 'Menus & Recipes',
    group: 'Menus & Recipes',
    groupDisplay: 'nested',
    groupIndex: true,
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-layout-grid',
    position: 'top',
    order: 29,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
