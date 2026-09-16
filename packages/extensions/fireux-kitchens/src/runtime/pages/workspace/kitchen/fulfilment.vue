<template>
  <UDashboardPanel id="kitchen-fulfilment"
    ><template #header
      ><LayoutsWorkspaceNavbar title="Delivery & payments" /></template
    ><template #body><WorkspaceKitchenFulfilment /></template
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
