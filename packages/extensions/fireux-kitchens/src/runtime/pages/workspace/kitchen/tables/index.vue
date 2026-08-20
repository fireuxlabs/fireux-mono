<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-tables">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Tables">
          <template #right>
            <UButton
              v-if="canWrite"
              to="/workspace/kitchen/tables/edit"
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-pencil"
            >
              Edit tables
            </UButton>
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="space-y-6">
          <WorkspaceKitchenOperationsCapabilityTools operation="tables" />
          <WorkspaceKitchenOperationsCapabilityAI operation="tables" />
          <WorkspaceKitchenOperationsCapabilityView operation="tables" />
          <p class="m-0 text-sm text-muted">
            View table tabs, staged service rounds, and table billing.
          </p>

          <WorkspaceKitchenOperationsTables />
          <WorkspaceKitchenOperationsGuidingLiterature operation="tables" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceTables } from '../../../../kitchen/composables/workspace/operations/Tables/useKitchenWorkspaceTables'

const { canWrite } = useKitchenWorkspaceTables()

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-tables',
    label: 'Tables',
    icon: 'i-lucide-layout-grid',
    position: 'top',
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
