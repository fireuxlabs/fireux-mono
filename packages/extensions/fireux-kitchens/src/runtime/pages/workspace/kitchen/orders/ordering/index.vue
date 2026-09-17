<template>
  <UDashboardPanel id="kitchen-ordering"
    ><template #header><LayoutsWorkspaceNavbar title="Ordering" /></template
    ><template #body><WorkspaceKitchenOrdering /></template
  ></UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-ordering',
    label: 'Ordering',
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
