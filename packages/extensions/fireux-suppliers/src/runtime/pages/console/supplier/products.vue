<template>
  <UDashboardPanel id="console-supplier-products">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Products" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierProducts />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-products',
    label: 'Products',
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
