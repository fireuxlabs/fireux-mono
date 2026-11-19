<template>
  <WorkspaceKitchenHome />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
