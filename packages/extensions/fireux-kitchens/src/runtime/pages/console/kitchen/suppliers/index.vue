<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-suppliers">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Suppliers" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsSuppliers />
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
    key: 'console-kitchen-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
