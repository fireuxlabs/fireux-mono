<template>
  <KitchenFinance />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-finance',
    label: 'Sales',
    group: 'Reports',
    hidden: true,
    groupIcon: 'i-lucide-chart-no-axes-combined',
    icon: 'i-lucide-chart-column',
    position: 'top',
    order: 70,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
