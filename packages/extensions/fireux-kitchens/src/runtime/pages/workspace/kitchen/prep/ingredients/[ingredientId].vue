<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.prep.ingredients"
    label="Ingredients"
    context-label="Prep"
  />
  <section class="workspace-surface workspace-surface--compact">
    <KitchenPrepAndProductionIngredientsDetail />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-ingredient-detail',
    label: 'Ingredient Detail',
    icon: 'i-lucide-carrot',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    menus: ['workspace'],
  },
})
</script>
