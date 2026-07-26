<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <ConsoleKitchenOperationsOrders />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'kitchen-orders',
  consoleSurface: 'live',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-orders',
    label: 'Orders',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    order: 8,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
