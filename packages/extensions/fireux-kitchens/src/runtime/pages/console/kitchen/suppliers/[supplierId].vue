<template>
  <UDashboardPanel id="console-kitchen-supplier-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Supplier" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenSupplier />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-supplier-detail',
    label: 'Supplier Detail',
    icon: 'i-lucide-truck',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
