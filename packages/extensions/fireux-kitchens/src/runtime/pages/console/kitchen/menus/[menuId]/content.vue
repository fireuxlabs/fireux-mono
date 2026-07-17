<template>
  <UDashboardPanel id="console-kitchen-menu-content">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Content" />
    </template>

    <template #body>
      <ConsoleKitchenOperationsMenusContent />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-content',
    label: 'Menu Content',
    icon: 'i-lucide-list-tree',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
