<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOverview />
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
    key: 'console-kitchen-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
