<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-mise-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Mise" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsMiseTasksTask />
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
    key: 'console-kitchen-mise-detail',
    label: 'Mise Detail',
    icon: 'i-lucide-list-todo',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
