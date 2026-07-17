<template>
  <UDashboardPanel id="console-kitchen-menu-ordering-collection">
    <template #header>
      <LayoutsConsoleNavbar title="Collection" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusOrderingCollection />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-ordering-collection',
    label: 'Collection',
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
