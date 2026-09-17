<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-property-reservation-detail">
      <template #header>
        <LayoutsWorkspaceNavbar title="Reservation">
          <template #right>
            <UButton
              to="/workspace/property/reservations"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
            >
              Reservations
            </UButton>
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="space-y-5">
          <WorkspacePropertyReservationsDetail
            :reservation-id="reservationId"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-reservations'] },
  requiresAuth: true,
  requiresSelection: true,
})

const reservationId = useRouteParam('reservationId')
</script>
