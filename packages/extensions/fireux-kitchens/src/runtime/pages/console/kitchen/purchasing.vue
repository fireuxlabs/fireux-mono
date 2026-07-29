<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-purchasing">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Purchasing" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenSundriesParked
            alert-title="Kitchen purchasing is parked"
            description="This route remains hidden until Kitchen-owned purchase orders and supplier invoices have authoritative producers."
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-purchasing',
    label: 'Purchasing',
    icon: 'i-lucide-shopping-cart',
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
