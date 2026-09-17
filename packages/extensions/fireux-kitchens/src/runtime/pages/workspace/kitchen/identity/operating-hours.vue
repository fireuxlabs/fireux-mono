<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-operating-hours">
      <template #header
        ><LayoutsWorkspaceNavbar title="Operating hours"
      /></template>
      <template #body>
        <div class="workspace-profile"><WorkspaceKitchenOperatingHours /></div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  requiresAuth: true,
  requiresSelection: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-operating-hours',
    label: 'Operating hours',
    group: 'Identity',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-clock',
    position: 'top',
    order: 81,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
