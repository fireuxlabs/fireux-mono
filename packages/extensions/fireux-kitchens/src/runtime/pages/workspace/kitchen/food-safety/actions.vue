<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.food-safety.actions"
    label="Corrective actions"
    context-label="Food Safety"
  /><KitchenFoodSafetyPage view="actions" />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
