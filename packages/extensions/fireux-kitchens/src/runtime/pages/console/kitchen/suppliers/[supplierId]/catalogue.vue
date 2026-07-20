<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-supplier-catalogue">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Catalogue" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsSuppliersCatalogue />
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
    key: 'console-kitchen-supplier-catalogue',
    label: 'Supplier Catalogue',
    icon: 'i-lucide-book-open',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
