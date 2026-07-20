<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-supplier-procurement">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Procurement" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsSuppliersProcurement />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-supplier-procurement',
    label: 'Supplier Procurement',
    icon: 'i-lucide-list-checks',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
