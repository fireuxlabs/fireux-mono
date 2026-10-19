<template>
  <WorkspaceKitchenNavigationGroup
    nav-key="workspace-kitchen-reports"
  ></WorkspaceKitchenNavigationGroup>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-reports',
    label: 'Reports',
    description:
      'Review sales, food costs, service and waste using each report’s available records.',
    group: '',
    groupIndex: true,
    icon: 'i-lucide-chart-no-axes-combined',
    position: 'top',
    order: 70,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Sales',
        to: '/workspace/kitchen/reports/finance',
        icon: 'i-lucide-chart-column',
      },
      {
        label: 'Service',
        to: '/workspace/kitchen/reports/performance',
        icon: 'i-lucide-gauge',
      },
      {
        label: 'Food costs',
        to: '/workspace/kitchen/reports/costs',
        icon: 'i-lucide-calculator',
      },
      {
        label: 'Waste report',
        to: '/workspace/kitchen/reports/waste-report',
        icon: 'i-lucide-recycle',
      },
    ],
  },
})
</script>
