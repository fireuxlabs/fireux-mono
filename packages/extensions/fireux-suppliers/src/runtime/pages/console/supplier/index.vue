<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierIndex />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier',
    label: 'Supplier',
    icon: 'i-lucide-truck',
    position: 'bottom',
    requiresSelection: false,
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
