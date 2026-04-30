<template>
  <UDashboardPanel id="console-portfolio-clients">
    <template #header>
      <LayoutsConsoleNavbar title="Clients" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsolePortfolioClients />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-clients',
    label: 'Clients',
    icon: 'i-lucide-users',
    position: 'top',
    requiresSelection: true,
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
