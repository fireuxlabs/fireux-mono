<template>
  <UDashboardPanel id="console-kitchen-haccp">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen HACCP" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          title="Kitchen HACCP is parked"
          description="This kitchen console route is intentionally hidden until the HACCP workspace is wired."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-haccp',
    label: 'HACCP',
    icon: 'i-lucide-clipboard-check',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 80,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
