<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-menu-source-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Source" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsMenusCreationDetail />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-menu-source-detail',
    label: 'Menu Source',
    icon: 'i-lucide-file-search',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
