<template>
  <KitchenPrepAndProductionLibraryRead view="preparations" />
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
    key: 'workspace-kitchen-preparations',
    label: 'Preparations',
    group: 'Prep & Production',
    hidden: true,
  },
})
</script>
