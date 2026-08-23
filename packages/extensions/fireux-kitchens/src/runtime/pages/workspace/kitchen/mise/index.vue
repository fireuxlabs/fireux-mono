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
          <WorkspaceKitchenResearchSegue
            capability="Mise"
            base-path="/workspace/kitchen/mise/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenMiseWorkspace } from '../../../../kitchen/composables/workspace/operations/Mise/useKitchenMiseWorkspace'

provideKitchenMiseWorkspace()

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-mise',
    label: 'Mise',
    group: 'Operations',
    icon: 'i-lucide-list-checks',
    position: 'top',
    order: 21,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
