<template>
  <WorkspaceGroupPage
    workspace="kitchen"
    nav-key="workspace-kitchen-food-safety"
    notice="Food safety checks, records and procedures are not connected yet. This page does not certify Kitchen safety."
  ></WorkspaceGroupPage>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-food-safety',
    label: 'Food Safety',
    description: 'Organise checks, evidence, follow-up and working procedures.',
    groupIndex: true,
    group: '',
    icon: 'i-lucide-shield-check',
    position: 'top',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Due checks',
        to: '/workspace/kitchen/food-safety/checks',
        icon: 'i-lucide-list-checks',
      },
      { label: 'Records', to: '/workspace/kitchen/food-safety/records' },
      {
        label: 'Corrective actions',
        to: '/workspace/kitchen/food-safety/actions',
      },
      { label: 'Procedures', to: '/workspace/kitchen/food-safety/procedures' },
    ],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
