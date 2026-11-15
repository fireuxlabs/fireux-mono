<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.food-safety.checks"
    label="Due checks"
    context-label="Food Safety"
  /><KitchenFoodSafetyPage view="checks" />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
