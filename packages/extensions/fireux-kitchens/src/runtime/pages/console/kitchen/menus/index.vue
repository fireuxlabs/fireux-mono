<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-menus">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Menus" />

        <UDashboardToolbar>
          <template #right>
            <UButton
              v-if="canWrite"
              to="/console/kitchen/menus/create#import-menu"
              color="neutral"
              variant="soft"
              icon="i-lucide-upload"
              size="sm"
            >
              Import
            </UButton>
            <UButton
              v-if="canWrite"
              to="/console/kitchen/menus/create#create-menu"
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
          <ConsoleKitchenOperationsCapabilityTools operation="menus" />
          <ConsoleKitchenOperationsCapabilityAI operation="menus" />
          <ConsoleKitchenOperationsCapabilityView operation="menus" />
          <ConsoleKitchenOperationsMenus />
          <ConsoleKitchenOperationsGuidingLiterature operation="menus" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsole } from '../../../../kitchen/composables/console/core/useKitchenConsole'

const {
  runtime: { canWrite },
} = useKitchenConsole()

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-menus',
    label: 'Menus',
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
