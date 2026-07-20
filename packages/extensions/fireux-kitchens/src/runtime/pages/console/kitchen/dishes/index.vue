<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-dishes">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Dishes" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsDishes />
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
    key: 'console-kitchen-dishes',
    label: 'Dishes',
    icon: 'i-lucide-cooking-pot',
    position: 'top',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
