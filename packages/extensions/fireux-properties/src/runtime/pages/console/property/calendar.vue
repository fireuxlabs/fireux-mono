<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-property-calendar">
      <template #header>
        <LayoutsConsoleNavbar title="Calendar">
          <template #right>
            <ConsoleAICapabilityPlaceholder capability="Property Calendar" />
          </template>
        </LayoutsConsoleNavbar>
      </template>
      <template #body
        ><UAlert
          title="Calendar"
          description="Property calendar tools are coming next."
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
    key: 'console-property-calendar',
    label: 'Calendar',
    icon: 'i-lucide-calendar-range',
    position: 'top',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
