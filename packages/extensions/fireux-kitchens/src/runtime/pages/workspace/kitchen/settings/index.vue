<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-settings">
      <template #header><LayoutsWorkspaceNavbar title="Settings" /></template>
      <template #body><WorkspaceKitchenSettings /></template>
    </UDashboardPanel>
  </div>
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
    icon: 'i-lucide-settings-2',
    order: 90,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      { label: 'Ordering channels', to: '/workspace/kitchen/settings' },
      { label: 'Devices & stations', to: '/workspace/kitchen/orders/kiosks' },
      {
        label: 'Integrations',
        to: '/workspace/kitchen/settings?view=integrations',
      },
      { label: 'Access', to: '/workspace/kitchen/settings?view=access' },
    ],
  },
})
</script>
