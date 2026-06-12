<template>
  <UDashboardPanel id="console-supplier-team">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Team" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierTeam />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    requiresSelection: true,
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
