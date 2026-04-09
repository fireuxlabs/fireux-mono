<template>
  <UDashboardPanel id="console-portfolio-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Portfolio" />
    </template>

    <template #body>
      <section class="space-y-4">
        <PortfolioCreateSystem
          mode="console"
          return-to="/console/portfolio"
          cancel-to="/console/portfolio"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    requiresSelection: false,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
