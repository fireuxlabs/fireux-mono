<template>
  <UDashboardPanel id="console-supplier-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle" />
    </template>

    <template #body>
      <div class="console-profile">
        <ConsoleSupplierIdentity />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const navTitle = 'Supplier Identity'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    requiresSelection: true,
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
