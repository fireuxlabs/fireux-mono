<template>
  <ConsoleKitchenSundriesParked
    panel-id="console-kitchen-purchase-orders"
    title="Kitchen Purchase Orders"
    alert-title="Kitchen purchase orders are parked"
    description="This kitchen console route is intentionally hidden until purchase orders are wired."
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-purchase-orders',
    label: 'Purchase Orders',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 82,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
