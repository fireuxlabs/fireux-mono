<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-property-reservation-detail">
      <template #header>
        <LayoutsConsoleNavbar title="Reservation">
          <template #right>
            <UButton
              to="/console/property/reservations"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
            >
              Reservations
            </UButton>
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="space-y-5">
          <ConsolePropertyOperationsReservationsDetail
            :reservation-id="reservationId"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'detail',
  visibility: { modules: ['fireux-reservations'] },
  requiresAuth: true,
  requiresSelection: true,
})

const reservationId = useRouteParam('reservationId')
</script>
