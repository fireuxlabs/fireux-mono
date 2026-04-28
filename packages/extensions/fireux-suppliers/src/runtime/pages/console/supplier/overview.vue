<template>
  <UDashboardPanel id="console-supplier-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <ConsoleSupplierOverview />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    position: 'top',
    requiresSelection: true,
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
