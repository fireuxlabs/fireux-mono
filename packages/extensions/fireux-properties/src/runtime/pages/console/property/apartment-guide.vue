<template>
  <UDashboardPanel id="console-property-apartment-guide">
    <template #header>
      <LayoutsConsoleNavbar title="Property Apartment Guide" />
    </template>

    <template #body>
      <ConsolePropertyInfoEditor page-key="apartment-guide" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-apartment-guide',
    label: 'Apartment Guide',
    icon: 'i-lucide-info',
    position: 'top',
    requiresSelection: true,
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
