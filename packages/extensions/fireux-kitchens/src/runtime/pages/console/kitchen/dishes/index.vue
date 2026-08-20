<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-dishes">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Dishes" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenOperationsCapabilityTools operation="dishes" />
          <ConsoleKitchenOperationsCapabilityAI operation="dishes" />
          <ConsoleKitchenOperationsCapabilityView operation="dishes" />
          <ConsoleKitchenOperationsDishes />
          <ConsoleKitchenOperationsGuidingLiterature operation="dishes" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/console/operations/Dishes/useKitchenDishesWorkspace'

provideKitchenDishesWorkspace()

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-dishes',
    label: 'Dishes',
    icon: 'i-lucide-cooking-pot',
    position: 'top',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
