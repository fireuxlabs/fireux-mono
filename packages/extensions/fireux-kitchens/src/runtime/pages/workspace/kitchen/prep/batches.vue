<template>
  <KitchenWorkspacePrepPlanning view="batches" />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
