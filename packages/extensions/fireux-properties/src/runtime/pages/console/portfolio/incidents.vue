<template>
  <UDashboardPanel id="console-portfolio-incidents">
    <template #header>
      <LayoutsConsoleNavbar title="Incidents" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsolePortfolioOperationsIncidents />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-incidents',
    label: 'Incidents',
    icon: 'i-lucide-triangle-alert',
    position: 'top',
    requiresSelection: true,
    order: 35,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
