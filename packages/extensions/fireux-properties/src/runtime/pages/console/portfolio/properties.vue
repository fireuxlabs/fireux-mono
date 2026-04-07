<template>
  <UDashboardPanel id="console-portfolio-properties">
    <template #header>
      <LayoutsConsoleNavbar title="Properties" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="Portfolio properties are not wired yet"
        description="The portfolio console is currently normalized around the live index and overview seam. Property views can be brought back later as a separate pass."
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-properties',
    label: 'Properties',
    icon: 'i-lucide-building',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
