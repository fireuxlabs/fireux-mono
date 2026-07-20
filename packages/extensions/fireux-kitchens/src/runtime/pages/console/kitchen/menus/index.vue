<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-menus">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Menus" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsMenus />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-menus',
    label: 'Menus',
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
