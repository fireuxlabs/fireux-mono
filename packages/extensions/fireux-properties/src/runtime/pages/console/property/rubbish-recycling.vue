<template>
  <UDashboardPanel id="console-property-rubbish-recycling">
    <template #header>
      <LayoutsConsoleNavbar title="Property Rubbish & Recycling" />
    </template>

    <template #body>
      <ConsolePropertyInfoEditor page-key="rubbish-recycling" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-rubbish-recycling',
    label: 'Rubbish & Recycling',
    icon: 'i-lucide-recycle',
    position: 'top',
    requiresSelection: true,
    order: 70,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
