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
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-stations',
    label: 'Stations',
    icon: 'i-lucide-map-pinned',
    position: 'top',
    requiresSelection: true,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
