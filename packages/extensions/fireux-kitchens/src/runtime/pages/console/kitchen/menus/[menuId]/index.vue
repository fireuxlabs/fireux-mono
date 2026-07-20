<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-menu-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Detail" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsMenusMenu />
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
    key: 'console-kitchen-menu-detail',
    label: 'Menu Detail',
    icon: 'i-lucide-list-tree',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
