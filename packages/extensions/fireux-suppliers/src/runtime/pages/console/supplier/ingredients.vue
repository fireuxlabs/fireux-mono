<template>
  <UDashboardPanel id="console-supplier-ingredients">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Ingredients" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleSupplierIngredients />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-wheat',
    position: 'top',
    requiresSelection: true,
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
