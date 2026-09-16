<template>
  <UDashboardPanel id="kitchen-channels"
    ><template #header
      ><LayoutsWorkspaceNavbar title="Ordering channels" /></template
    ><template #body><WorkspaceKitchenChannels /></template
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
