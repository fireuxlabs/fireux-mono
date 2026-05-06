<template>
  <UDashboardPanel id="console-kitchen-menu-design">
    <template #header>
      <LayoutsConsoleNavbar title="Menu Design" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenMenuDesign />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu-design',
    label: 'Design',
    icon: 'i-lucide-palette',
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
