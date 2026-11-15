<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.food-safety.records"
    label="Records"
    context-label="Food Safety"
  /><KitchenFoodSafetyPage view="records" />
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
