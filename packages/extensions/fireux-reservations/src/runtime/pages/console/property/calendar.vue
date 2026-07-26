<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-property-calendar">
      <template #header>
        <LayoutsConsoleNavbar title="Calendar">
          <template #right>
            <UButton
              to="/console/property/reservations/create"
              icon="i-lucide-calendar-plus-2"
              size="sm"
            >
              Add booking
            </UButton>
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="space-y-5">
          <ConsolePropertyOperationsCalendar />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-reservations'] },
  nav: {
    key: 'console-property-calendar',
    label: 'Calendar',
    icon: 'i-lucide-calendar-range',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
