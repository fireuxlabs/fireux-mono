<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <UDashboardPanel id="console-kitchen-menu-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Menu" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsMenusCreation />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'create',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-menu-create',
    label: 'Create Menu',
    icon: 'i-lucide-plus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
