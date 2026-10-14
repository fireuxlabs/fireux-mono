<template>
  <UDashboardPanel id="kitchen-offerings"
    ><template #header><LayoutsWorkspaceNavbar title="Channels & services" /></template
    ><template #body><WorkspaceKitchenOrdersChannels /></template
  ></UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-channels',
    label: 'Channels & services',
    hidden: true,
    icon: 'i-lucide-shopping-bag',
    position: 'top',
    order: 12,
    layouts: ['workspace'],
    desktop: true,
    mobile: true,
  },
})
</script>
