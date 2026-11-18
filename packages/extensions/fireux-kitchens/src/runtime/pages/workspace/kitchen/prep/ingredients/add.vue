<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.prep.ingredients"
    label="Ingredients"
    context-label="Prep"
  />
  <section class="workspace-surface workspace-surface--compact">
    <KitchenWorkspacePrepIngredientsAdd />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'create',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-ingredient-add',
    label: 'Create Ingredient',
    icon: 'i-lucide-plus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    menus: ['workspace'],
  },
})
</script>
