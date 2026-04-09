<template>
  <UDashboardPanel id="console-supplier-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Supplier" />
    </template>

    <template #body>
      <section class="space-y-4">
        <SupplierCreateSystem
          mode="console"
          return-to="/console/supplier"
          cancel-to="/console/supplier"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    requiresSelection: false,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
