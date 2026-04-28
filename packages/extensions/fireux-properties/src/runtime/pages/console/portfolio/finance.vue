<template>
  <UDashboardPanel id="console-portfolio-finance">
    <template #header>
      <LayoutsConsoleNavbar title="Financial Signals" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          title="Portfolio finance is parked"
          description="This portfolio console route is intentionally hidden until finance views are wired."
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
    key: 'console-portfolio-finance',
    label: 'Financial Signals',
    icon: 'i-lucide-chart-line',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 25,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
