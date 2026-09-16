<template>
  <UDashboardPanel id="kitchen-ordering-service"
    ><template #header><LayoutsWorkspaceNavbar title="Ordering" /></template
    ><template #body><WorkspaceKitchenOrderingService /></template
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
