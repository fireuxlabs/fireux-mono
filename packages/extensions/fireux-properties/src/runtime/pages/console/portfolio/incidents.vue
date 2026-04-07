<template>
  <UDashboardPanel id="console-portfolio-incidents">
    <template #header>
      <LayoutsConsoleNavbar title="Incidents" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="Portfolio incidents are not wired yet"
        description="The portfolio console is currently normalized around the live index and overview seam. Incident tools can be brought back later as a separate surface."
      />
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
    order: 35,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
