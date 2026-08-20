<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-mise">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Mise" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="mise" />
          <WorkspaceKitchenOperationsCapabilityAI operation="mise" />
          <WorkspaceKitchenOperationsCapabilityView operation="mise" />
          <WorkspaceKitchenOperationsMise />
          <WorkspaceKitchenOperationsGuidingLiterature operation="mise" />
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
    key: 'workspace-kitchen-mise',
    label: 'Mise',
    icon: 'i-lucide-list-todo',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
