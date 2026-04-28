<template>
  <UDashboardPanel id="console-kitchen-orders">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Orders" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOrders />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-orders',
    label: 'Orders',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    requiresSelection: true,
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
