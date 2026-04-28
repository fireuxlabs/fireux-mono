<template>
  <UDashboardPanel id="console-portfolio-clients">
    <template #header>
      <LayoutsConsoleNavbar title="Clients" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          title="Portfolio clients are parked"
          description="This portfolio console route is intentionally hidden until client views are wired."
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
    key: 'console-portfolio-clients',
    label: 'Clients',
    icon: 'i-lucide-users',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
