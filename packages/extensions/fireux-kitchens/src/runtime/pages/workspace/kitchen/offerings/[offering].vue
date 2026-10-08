<template>
  <UDashboardPanel id="kitchen-offering"
    ><template #header><LayoutsWorkspaceNavbar title="Offerings" /></template
    ><template #body><WorkspaceKitchenOfferingsSingle /></template
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
