<template>
  <UDashboardPanel id="console-supplier-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Supplier Profile" />
    </template>

    <template #body>
      <SupplierCreateSystem
        return-to="/console/supplier/overview"
        cancel-to="/console/supplier/overview"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import SupplierCreateSystem from '../../../components/console/supplier/Create/System.vue'

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
