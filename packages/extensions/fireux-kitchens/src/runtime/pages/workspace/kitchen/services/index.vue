<template>
  <UDashboardPanel id="kitchen-offerings"
    ><template #header><LayoutsWorkspaceNavbar title="Services" /></template
    ><template #body><WorkspaceKitchenOfferings /></template
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
    group: '',
    icon: 'i-lucide-shopping-bag',
    position: 'top',
    order: 12,
    layouts: ['workspace'],
    desktop: true,
    mobile: true,
  },
})
</script>
