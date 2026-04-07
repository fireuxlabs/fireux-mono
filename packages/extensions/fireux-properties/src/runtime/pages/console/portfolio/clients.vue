<template>
  <UDashboardPanel id="console-portfolio-clients">
    <template #header>
      <LayoutsConsoleNavbar title="Clients" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="Portfolio clients are not wired yet"
        description="The portfolio console is currently normalized around the live index and overview seam. Client views can be brought back later as a separate pass."
      />
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
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
