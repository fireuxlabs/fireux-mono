<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-settings">
      <template #header><LayoutsWorkspaceNavbar title="Settings" /></template>
      <template #body><WorkspaceKitchenSettings /></template>
    </UDashboardPanel>
  </div>
</template>
<script setup lang="ts">
import WorkspaceKitchenSettings from '../../../../kitchen/components/Workspace/Settings/Index.vue'
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
    groupIndex: true,
    icon: 'i-lucide-settings-2',
    order: 90,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Kitchen listing',
        to: '/workspace/kitchen/identity',
        icon: 'i-lucide-store',
      },
      {
        label: 'Venue profile',
        to: '/workspace/kitchen/identity/profile',
        icon: 'i-lucide-map-pin',
      },
      {
        label: 'Operating hours',
        to: '/workspace/kitchen/identity/operating-hours',
        icon: 'i-lucide-clock',
      },
      {
        label: 'Appearance',
        to: '/workspace/kitchen/identity/appearance',
        icon: 'i-lucide-palette',
      },
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
