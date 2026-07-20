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
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-ordering-delivery',
    label: 'Delivery',
    icon: 'i-lucide-truck',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
