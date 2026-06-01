<template>
  <UDashboardPanel id="console-supplier-catalogue">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Catalogue" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierCatalogue />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-catalogue',
    label: 'Catalogue',
    icon: 'i-lucide-book-open',
    position: 'top',
    requiresSelection: true,
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
