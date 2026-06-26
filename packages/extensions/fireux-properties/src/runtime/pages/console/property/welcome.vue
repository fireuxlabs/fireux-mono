<template>
  <UDashboardPanel id="console-property-welcome">
    <template #header>
      <LayoutsConsoleNavbar title="Property Welcome" />
    </template>

    <template #body>
      <ConsolePropertySundriesInfoEditor page-key="welcome" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-welcome',
    label: 'Welcome',
    icon: 'i-lucide-hand-heart',
    position: 'top',
    requiresSelection: true,
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
