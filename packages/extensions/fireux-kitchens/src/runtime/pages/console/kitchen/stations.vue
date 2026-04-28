<template>
  <UDashboardPanel id="console-kitchen-stations">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Stations" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          title="Kitchen stations are parked"
          description="This kitchen console route is intentionally hidden until station management is wired."
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
    key: 'console-kitchen-stations',
    label: 'Stations',
    icon: 'i-lucide-map-pinned',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 83,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
