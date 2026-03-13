<template>
  <UDashboardPanel id="console-portfolio-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Portfolio" />
    </template>

    <template #body>
      <PortfolioCreateSystem
        return-to="/console/portfolio/overview"
        cancel-to="/console/portfolio/overview"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PortfolioCreateSystem from 'fireux-properties/runtime/components/organisms/Portfolio/Create/System.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
