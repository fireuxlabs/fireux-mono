<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-supplier-items">
    <template #header>
      <LayoutsConsoleNavbar title="Items" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierOperationsItems />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'console-supplier-items',
    label: 'Items',
    icon: 'i-lucide-package',
    position: 'top',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
