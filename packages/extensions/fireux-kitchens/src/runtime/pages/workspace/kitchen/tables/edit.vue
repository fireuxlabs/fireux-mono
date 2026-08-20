<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: localize the one narrow workspace form. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-tables-edit">
      <template #header>
        <LayoutsWorkspaceNavbar title="Edit Kitchen Tables">
          <template #right>
            <UButton
              to="/workspace/kitchen/tables"
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
            >
              Tables
            </UButton>
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="mx-auto w-full max-w-xl space-y-6">
          <p class="m-0 text-sm text-muted">
            Configure the numbered tables available to table service.
          </p>

          <WorkspaceKitchenOperationsTablesWrite v-if="canWrite" />

          <UAlert
            v-else
            color="neutral"
            variant="soft"
            title="Table configuration is read only"
            description="Select a writable kitchen before editing its tables."
          />
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
  workspaceSurface: 'edit',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
