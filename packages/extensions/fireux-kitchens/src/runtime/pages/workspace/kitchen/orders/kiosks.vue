<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-kiosks">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kiosks">
          <template #right>
            <UButton
              to="/workspace/kitchen/orders"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              label="Orders"
            />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <UPageHeader title="Devices &amp; stations" description="Manage the screens and work areas used by your kitchen." />
        <UButton to="/workspace/kitchen/stations" label="Station setup" icon="i-lucide-chef-hat" color="neutral" variant="soft" />
        <WorkspaceKitchenOrdersKiosks />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'live',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-kiosks',
    label: 'Kiosks',
    group: 'Settings',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-settings-2',
    icon: 'i-lucide-monitor-smartphone',
    position: 'top',
    order: 71,
    layouts: ['workspace'],
    hidden: true,
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
