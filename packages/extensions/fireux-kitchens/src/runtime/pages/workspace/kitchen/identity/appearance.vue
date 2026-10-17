<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-appearance">
      <template #header><LayoutsWorkspaceNavbar title="Appearance" /></template>
      <template #body>
        <div class="workspace-profile">
          <UBreadcrumb
            class="mb-4"
            :ui="{ list: 'flex-wrap' }"
            :items="[
              { label: 'Settings', to: '/workspace/kitchen/settings' },
              { label: 'Appearance' },
            ]"
          /><WorkspaceKitchenAppearance />
        </div>
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
    hidden: true,
    key: 'workspace-kitchen-appearance',
    label: 'Appearance',
    description: 'Menu colours and a preview of your public menu',
    group: 'Settings',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-palette',
    position: 'top',
    order: 83,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
