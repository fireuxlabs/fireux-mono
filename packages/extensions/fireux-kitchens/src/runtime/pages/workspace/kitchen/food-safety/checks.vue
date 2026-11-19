<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.food-safety.checks"
    label="Due checks"
    context-label="Food Safety"
  /><WorkspaceKitchenFoodSafetyPage view="checks" />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
