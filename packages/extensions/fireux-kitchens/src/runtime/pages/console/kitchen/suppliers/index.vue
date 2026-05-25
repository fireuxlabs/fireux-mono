<template>
  <UDashboardPanel id="console-kitchen-suppliers">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Suppliers" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenSuppliers />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    position: 'top',
    requiresSelection: true,
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
