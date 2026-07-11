<template>
  <UDashboardPanel id="console-kitchen-haccp">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen HACCP" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenSundriesParked
          alert-title="Kitchen HACCP is parked"
          description="This kitchen console route is intentionally hidden until the HACCP workspace is wired."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-haccp',
    label: 'HACCP',
    icon: 'i-lucide-clipboard-check',
    position: 'top',
    hidden: true,
    parked: true,
    order: 80,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
