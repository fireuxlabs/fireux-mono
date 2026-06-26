<template>
  <UDashboardPanel id="console-property-house-rules">
    <template #header>
      <LayoutsConsoleNavbar title="Property House Rules" />
    </template>

    <template #body>
      <ConsolePropertySundriesInfoEditor page-key="house-rules" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-house-rules',
    label: 'House Rules',
    icon: 'i-lucide-clipboard-check',
    position: 'top',
    requiresSelection: true,
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
