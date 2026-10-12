<template>
  <UDashboardPanel id="workspace-kitchen-prep-plan"
    ><template #header><LayoutsWorkspaceNavbar title="Prep plan" /></template
    ><template #body><WorkspaceKitchenPrep /></template
  ></UDashboardPanel>
</template>
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
