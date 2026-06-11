<template>
  <UDashboardPanel id="console-property-checkout">
    <template #header>
      <LayoutsConsoleNavbar title="Property Checkout" />
    </template>

    <template #body>
      <ConsolePropertyInfoEditor page-key="checkout" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-checkout',
    label: 'Checkout',
    icon: 'i-lucide-door-open',
    position: 'top',
    requiresSelection: true,
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
