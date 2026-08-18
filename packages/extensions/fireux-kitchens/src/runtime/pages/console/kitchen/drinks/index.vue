<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-drinks">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Drinks">
          <template #right>
            <ConsoleAIOperationPlaceholder operation="Drinks" />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenOperationsDishes />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/console/operations/Dishes/useKitchenDishesWorkspace'

provideKitchenDishesWorkspace('drink')

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-drinks',
    label: 'Drinks',
    icon: 'i-lucide-glass-water',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
