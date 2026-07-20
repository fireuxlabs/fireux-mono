<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierIndex />
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
    key: 'console-supplier',
    label: 'Supplier',
    icon: 'i-lucide-truck',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
