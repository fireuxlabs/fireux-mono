<template>
  <UDashboardPanel id="console-kitchen-dev">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Dev" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          title="Kitchen dev is parked"
          description="This kitchen console route is intentionally hidden until a console-owned dev workspace is needed."
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
    key: 'console-kitchen-dev',
    label: 'Dev',
    icon: 'i-lucide-wrench',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 85,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
