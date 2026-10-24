<template>
  <UDashboardPanel id="kitchen-integrations"
    ><template #header><WorkspaceNavbar title="Integrations" /></template
    ><template #body><KitchenIntegrations /></template
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
