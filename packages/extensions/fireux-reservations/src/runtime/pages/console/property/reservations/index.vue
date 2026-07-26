<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-property-reservations">
      <template #header>
        <LayoutsConsoleNavbar title="Reservations">
          <template #right>
            <UButton
              to="/console/property/reservations/create"
              icon="i-lucide-plus"
              size="sm"
            >
              Add booking
            </UButton>
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="space-y-5">
          <ConsolePropertyOperationsReservations />
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
    key: 'console-property-reservations',
    label: 'Reservations',
    icon: 'i-lucide-book-open-check',
    position: 'top',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
