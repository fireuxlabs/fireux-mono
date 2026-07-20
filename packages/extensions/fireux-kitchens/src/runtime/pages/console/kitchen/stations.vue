<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-stations">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Stations" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsStations />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-stations',
    label: 'Stations',
    icon: 'i-lucide-map-pinned',
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
