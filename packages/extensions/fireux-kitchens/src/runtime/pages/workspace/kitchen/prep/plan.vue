<template><KitchenPrepAndProductionPlanning /></template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
