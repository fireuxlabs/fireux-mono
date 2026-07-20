<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
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
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-menu-ordering-collection',
    label: 'Collection',
    icon: 'i-lucide-shopping-bag',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
