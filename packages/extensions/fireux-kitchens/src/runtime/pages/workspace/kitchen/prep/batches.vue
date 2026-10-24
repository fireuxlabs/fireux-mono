<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-prep">
      <template #header
        ><WorkspaceNavbar title="Prep & Production"
      /></template>
      <template #body><KitchenPrepAndProductionPlanning view="batches" /></template>
    </UDashboardPanel>
  </div>
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
