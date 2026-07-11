<template>
  <UDashboardPanel id="console-kitchen-purchase-orders">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Purchase Orders" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenSundriesParked
          alert-title="Kitchen purchase orders are parked"
          description="This kitchen console route is intentionally hidden until purchase orders are wired."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-purchase-orders',
    label: 'Purchase Orders',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    hidden: true,
    parked: true,
    order: 82,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
