<!-- Concurrent edit — 2026-07-19 17:12 CEST — Pre-order pass: register the focused Pre-order settings route. -->
<template>
  <UDashboardPanel id="console-kitchen-menu-ordering-pre-order">
    <template #header>
      <LayoutsConsoleNavbar title="Pre-order" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusOrderingPreOrder />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-ordering-pre-order',
    label: 'Pre-order',
    icon: 'i-lucide-calendar-clock',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
