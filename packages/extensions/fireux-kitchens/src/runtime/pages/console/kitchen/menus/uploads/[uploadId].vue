<template>
  <UDashboardPanel id="console-kitchen-menu-source-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Source" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsMenusSource />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-source-detail',
    label: 'Menu Source',
    icon: 'i-lucide-file-search',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
