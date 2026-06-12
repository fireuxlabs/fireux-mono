<template>
  <UDashboardPanel id="console-portfolio-team">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Team" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsolePortfolioTeam />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-team',
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
