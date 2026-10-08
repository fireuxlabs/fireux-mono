<template>
  <UDashboardPanel id="kitchen-offerings"
    ><template #header><LayoutsWorkspaceNavbar title="Offerings" /></template
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
    key: 'workspace-kitchen-offerings',
    label: 'Offerings',
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
