<template>
  <UDashboardPanel id="console-kitchen-menu-source">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Source" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusSource />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-source',
    label: 'Menu Source',
    icon: 'i-lucide-file-scan',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
