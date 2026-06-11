<template>
  <UDashboardPanel id="console-property-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Property Overview" />
    </template>

    <template #body>
      <ConsolePropertyOverview />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    requiresSelection: true,
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
