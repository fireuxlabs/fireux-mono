<template>
  <UDashboardPanel id="kitchen-services"
    ><template #header><LayoutsWorkspaceNavbar title="Services" /></template
    ><template #body><WorkspaceKitchenServices /></template
  ></UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-services',
    label: 'Services',
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
