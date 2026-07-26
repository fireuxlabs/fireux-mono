<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: localize the one narrow console form. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-tables-edit">
      <template #header>
        <LayoutsConsoleNavbar title="Edit Kitchen Tables">
          <template #right>
            <UButton
              to="/console/kitchen/tables"
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
            >
              Tables
            </UButton>
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="mx-auto w-full max-w-xl space-y-6">
          <p class="m-0 text-sm text-muted">
            Configure the numbered tables available to table service.
          </p>

          <ConsoleKitchenOperationsTablesWrite v-if="canWrite" />

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
import { useKitchenConsoleTables } from '../../../../composables/fireux/console/kitchen/operations/Tables/useKitchenConsoleTables'

const { canWrite } = useKitchenConsoleTables()

definePageMeta({
  layout: 'console',
  consoleSurface: 'edit',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
