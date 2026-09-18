<template>
  <UDashboardPanel id="kitchen-services-service"
    ><template #header><LayoutsWorkspaceNavbar title="Services" /></template
    ><template #body><WorkspaceKitchenServicesService /></template
  ></UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
