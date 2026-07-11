<template>
  <UDashboardPanel id="console-kitchen-tables">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Tables">
        <template #right>
          <UButton
            v-if="canWrite"
            to="/console/kitchen/tables/edit"
            size="sm"
            color="neutral"
            variant="soft"
            icon="i-lucide-pencil"
          >
            Edit tables
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-6">
        <p class="m-0 text-sm text-muted">
          View table tabs, staged service rounds, and table billing.
        </p>

        <ConsoleKitchenOperationsTables />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useKitchenConsoleTables } from '../../../../composables/fireux/console/kitchen/operations/Tables/useKitchenConsoleTables'

const { canWrite } = useKitchenConsoleTables()

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-tables',
    label: 'Tables',
    icon: 'i-lucide-layout-grid',
    position: 'top',
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
