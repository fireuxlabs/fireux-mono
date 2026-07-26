<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-ingredients">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Ingredients" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenOperationsIngredients />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    position: 'top',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
