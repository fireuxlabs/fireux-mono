<template>
  <UDashboardPanel id="console-kitchen-supplier-procurement">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Procurement" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenSuppliersProcurement />
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
    key: 'console-kitchen-supplier-procurement',
    label: 'Supplier Procurement',
    icon: 'i-lucide-list-checks',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
