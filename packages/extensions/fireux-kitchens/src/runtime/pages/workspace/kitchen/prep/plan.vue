<template><KitchenWorkspacePrepPlanning /></template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
