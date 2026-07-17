<template>
  <UDashboardPanel id="console-kitchen-menu-ordering">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Ordering" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusOrdering />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-ordering',
    label: 'Menu Ordering',
    icon: 'i-lucide-shopping-bag',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
