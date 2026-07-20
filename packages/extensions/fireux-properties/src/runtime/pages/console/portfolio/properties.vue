<!-- Concurrent edit — 2026-07-20 16:22 CEST — Extension Console Spine pass: move route access metadata and park the unwired Properties view. -->
<template>
  <UDashboardPanel id="console-portfolio-properties">
    <template #header>
      <LayoutsConsoleNavbar title="Properties" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsolePortfolioOperationsProperties />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'console-portfolio-properties',
    label: 'Properties',
    icon: 'i-lucide-building',
    position: 'top',
    hidden: true,
    parked: true,
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
