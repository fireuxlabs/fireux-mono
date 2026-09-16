<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<!-- Concurrent edit — 2026-07-19 17:12 CEST — Pre-order pass: register the focused Pre-order settings route. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-menu-ordering-pre-order">
      <template #header>
        <LayoutsWorkspaceNavbar title="Pre-order" />
      </template>

      <template #body>
        <WorkspaceKitchenMenusOrderingPreOrder />
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
    key: 'workspace-kitchen-menu-ordering-pre-order',
    label: 'Pre-order',
    icon: 'i-lucide-calendar-clock',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
