<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-menu-ordering-kiosk">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kiosk" />
      </template>

      <template #body>
        <WorkspaceKitchenOperationsMenusOrderingKiosk />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-menu-ordering-kiosk',
    label: 'Kiosk',
    icon: 'i-lucide-monitor-smartphone',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
