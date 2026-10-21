<template><KitchenFoodSafetyPage view="actions" /></template>
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
