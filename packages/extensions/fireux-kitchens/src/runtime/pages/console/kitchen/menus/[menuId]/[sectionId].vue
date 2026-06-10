<template>
  <UDashboardPanel id="console-kitchen-menu-section">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Section" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusSectionsSection />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-section',
    label: 'Menu Section',
    icon: 'i-lucide-list',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
