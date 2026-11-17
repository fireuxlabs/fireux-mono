<template>
  <KitchenPrepAndProductionLibraryRead view="recipes" />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceHeader: 'content',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-recipes',
    label: 'Recipes',
    group: 'Prep & Production',
    hidden: true,
  },
})
</script>
