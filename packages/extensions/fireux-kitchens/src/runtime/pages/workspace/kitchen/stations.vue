<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-stations">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Stations" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="stations" />
          <WorkspaceKitchenOperationsCapabilityAI operation="stations" />
          <WorkspaceKitchenOperationsCapabilityView operation="stations" />
          <WorkspaceKitchenOperationsStations />
          <WorkspaceKitchenOperationsGuidingLiterature operation="stations" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-stations',
    label: 'Stations',
    icon: 'i-lucide-map-pinned',
    position: 'top',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
