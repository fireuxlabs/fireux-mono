<template>
  <UDashboardPanel id="console-kitchen-menu-publishing">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Publishing" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusPublishing />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-publishing',
    label: 'Menu Publishing',
    icon: 'i-lucide-send',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
