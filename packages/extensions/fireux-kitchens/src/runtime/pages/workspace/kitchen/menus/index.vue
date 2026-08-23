<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-menus">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Menus" />

        <UDashboardToolbar>
          <template #right>
            <UButton
              v-if="canWrite"
              to="/workspace/kitchen/menus/create#import-menu"
              color="neutral"
              variant="soft"
              icon="i-lucide-upload"
              size="sm"
            >
              Import
            </UButton>
            <UButton
              v-if="canWrite"
              to="/workspace/kitchen/menus/create#create-menu"
              icon="i-lucide-link"
              size="sm"
            >
              Create from URL
            </UButton>
          </template>
        </UDashboardToolbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOperationsCapabilityTools operation="menus" />
          <WorkspaceKitchenOperationsCapabilityAI operation="menus" />
          <WorkspaceKitchenOperationsCapabilityView operation="menus" />
          <WorkspaceKitchenOperationsMenus />
          <WorkspaceKitchenOperationsGuidingLiterature operation="menus" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useKitchenWorkspace } from '../../../../kitchen/composables/workspace/core/useKitchenWorkspace'

const {
  runtime: { canWrite },
} = useKitchenWorkspace()

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-menus',
    label: 'Menus',
    group: 'Food & Drink',
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
