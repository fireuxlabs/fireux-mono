<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: register the focused Delivery settings route. -->
<template>
  <UDashboardPanel id="console-kitchen-menu-ordering-delivery">
    <template #header>
      <LayoutsConsoleNavbar title="Delivery" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusOrderingDelivery />
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
    key: 'console-kitchen-menu-ordering-delivery',
    label: 'Delivery',
    icon: 'i-lucide-truck',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
