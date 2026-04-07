<template>
  <UDashboardPanel id="console-portfolio-finance">
    <template #header>
      <LayoutsConsoleNavbar title="Financial Signals" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="Portfolio finance is not wired yet"
        description="The portfolio console is currently normalized around the live index and overview seam. Finance views can be brought back later as a deliberate follow-up."
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-finance',
    label: 'Financial Signals',
    icon: 'i-lucide-chart-line',
    order: 25,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
