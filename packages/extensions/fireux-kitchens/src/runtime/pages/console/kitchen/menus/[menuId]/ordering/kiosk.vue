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
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-ordering-kiosk',
    label: 'Kiosk',
    icon: 'i-lucide-monitor-smartphone',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
