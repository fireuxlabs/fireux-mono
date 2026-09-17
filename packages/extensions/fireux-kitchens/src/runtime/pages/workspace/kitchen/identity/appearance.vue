<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-appearance">
      <template #header><LayoutsWorkspaceNavbar title="Appearance" /></template>
      <template #body>
        <div class="workspace-profile"><WorkspaceKitchenAppearance /></div>
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
    key: 'workspace-kitchen-appearance',
    label: 'Appearance',
    group: 'Identity',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-palette',
    position: 'top',
    order: 82,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
