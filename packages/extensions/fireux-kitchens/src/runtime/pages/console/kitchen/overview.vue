<template>
  <UDashboardPanel id="console-kitchen-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <ConsoleKitchenOverview />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-overview',
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
