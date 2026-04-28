<template>
  <UDashboardPanel id="console-supplier-identity">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Identity" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierIdentity />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-identity',
    label: 'Identity',
    icon: 'i-lucide-fingerprint',
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
