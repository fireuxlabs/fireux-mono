<template>
  <UDashboardPanel id="kitchen-integrations"
    ><template #header><LayoutsWorkspaceNavbar title="Integrations" /></template
    ><template #body><WorkspaceKitchenIntegrations /></template
  ></UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
