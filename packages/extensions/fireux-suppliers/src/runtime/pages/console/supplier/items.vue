<template>
  <UDashboardPanel id="console-supplier-items">
    <template #header>
      <LayoutsConsoleNavbar title="Items" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierOperationsItems />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-items',
    label: 'Items',
    icon: 'i-lucide-package',
    position: 'top',
    requiresSelection: true,
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
