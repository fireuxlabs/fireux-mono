<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-dish-detail">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Dish" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenOperationsDishesDish />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesWorkspace } from '../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenDishesWorkspace'

provideKitchenDishesWorkspace('food')

definePageMeta({
  layout: 'console',
  consoleSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-dish-detail',
    label: 'Dish Detail',
    icon: 'i-lucide-utensils',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
