<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-property-reservations">
      <template #header><LayoutsConsoleNavbar title="Reservations" /></template>
      <template #body
        ><UAlert
          title="Reservations"
          description="Property reservation tools are coming next."
          variant="soft"
      /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'console-property-reservations',
    label: 'Reservations',
    icon: 'i-lucide-calendar-days',
    position: 'top',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
