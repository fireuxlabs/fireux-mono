<template>
  <ConsoleKitchenOperationsOrders />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'kitchen-orders',
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
