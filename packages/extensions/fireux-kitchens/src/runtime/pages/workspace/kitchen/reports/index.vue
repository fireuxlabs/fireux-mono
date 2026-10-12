<template>
  <KitchenGroupIndex nav-key="workspace-kitchen-reports"></KitchenGroupIndex>
</template>
<script setup lang="ts">
import KitchenGroupIndex from '../../../../kitchen/components/Workspace/GroupIndex.vue'
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
    group: 'Reports',
    groupDisplay: 'nested',
    groupIndex: true,
    groupIcon: 'i-lucide-chart-no-axes-combined',
    icon: 'i-lucide-chart-no-axes-combined',
    position: 'top',
    order: 70,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
