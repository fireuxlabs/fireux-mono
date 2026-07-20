<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-menu-ordering-kiosk">
    <template #header>
      <LayoutsConsoleNavbar title="Kiosk" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusOrderingKiosk />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-menu-ordering-kiosk',
    label: 'Kiosk',
    icon: 'i-lucide-monitor-smartphone',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
