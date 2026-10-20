<template>
  <WorkspaceGroupPage
    workspace="kitchen"
    nav-key="workspace-kitchen-settings"
  />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-settings',
    label: 'Settings',
    group: '',
    description: 'Manage payments, integrations and Workspace access.',
    groupIndex: true,
    icon: 'i-lucide-settings-2',
    order: 90,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Payments',
        to: '/workspace/kitchen/identity/payments',
        icon: 'i-lucide-credit-card',
      },
      {
        label: 'Integrations',
        icon: 'i-lucide-plug',
        to: '/workspace/kitchen/settings/integrations',
      },
      {
        label: 'Access',
        to: '/workspace/kitchen/settings/access',
        icon: 'i-lucide-key-round',
      },
    ],
  },
})
</script>
