<template>
  <UDashboardPanel id="console-kitchen-tables">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Tables" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsTables />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-tables',
    label: 'Tables',
    icon: 'i-lucide-layout-grid',
    position: 'top',
    requiresSelection: true,
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
