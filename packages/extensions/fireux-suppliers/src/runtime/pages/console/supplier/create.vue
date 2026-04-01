<template>
  <UDashboardPanel id="console-supplier-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Supplier" />
    </template>

    <template #body>
      <SupplierCreateSystem
        mode="console"
        return-to="/console/supplier"
        cancel-to="/console/supplier"
      />
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
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
