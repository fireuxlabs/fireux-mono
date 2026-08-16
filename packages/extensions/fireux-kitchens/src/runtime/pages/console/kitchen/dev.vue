<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-dev">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen Dev" />
      </template>

      <template #body>
        <section class="space-y-4">
          <ConsoleKitchenSundriesParked
            alert-title="Kitchen dev is parked"
            description="This kitchen console route is intentionally hidden until a console-owned dev workspace is needed."
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-dev',
    label: 'Dev',
    icon: 'i-lucide-wrench',
    position: 'top',
    hidden: true,
    parked: true,
    order: 85,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
  roles: ['developer'],
})
</script>
