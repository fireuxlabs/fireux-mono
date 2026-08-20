<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-menu-publishing">
      <template #header>
        <LayoutsWorkspaceNavbar title="Menu Publishing" />
      </template>

      <template #body>
        <WorkspaceKitchenOperationsMenusPublishing />
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
    key: 'workspace-kitchen-menu-publishing',
    label: 'Menu Publishing',
    icon: 'i-lucide-send',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
