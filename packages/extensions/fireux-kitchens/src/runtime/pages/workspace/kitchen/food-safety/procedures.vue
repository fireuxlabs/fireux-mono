<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.food-safety.procedures"
    label="Procedures"
    context-label="Food Safety"
  /><KitchenFoodSafetyPage view="procedures" />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
