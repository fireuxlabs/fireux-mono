<template>
  <UButton
    to="/workspace/property/reservations"
    icon="i-lucide-arrow-left"
    color="neutral"
    variant="ghost"
    size="sm"
  >
    Reservations
  </UButton>
  <section class="space-y-5">
    <WorkspacePropertyReservationsDetail :reservation-id="reservationId" />
  </section>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-reservations'] },
  requiresAuth: true,
  requiresSelection: true,
})

const reservationId = useRouteParam('reservationId')
</script>
