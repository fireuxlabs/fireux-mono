<template>
  <UDashboardPanel id="console-kitchen-supplier-catalogue">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Catalogue" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsSuppliersCatalogue />
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
    key: 'console-kitchen-supplier-catalogue',
    label: 'Supplier Catalogue',
    icon: 'i-lucide-book-open',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
