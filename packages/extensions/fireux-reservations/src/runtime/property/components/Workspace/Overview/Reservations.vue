<template>
  <section class="grid gap-5 md:grid-cols-2" aria-label="Reservation summaries">
    <Summary
      title="Reservations"
      icon="i-lucide-calendar-days"
      to="/workspace/property/reservations"
      :value="settled ? reservations.summary.value.total : '—'"
      :pending="reservations.outcome.value === 'pending'"
      :error="reservations.outcome.value === 'error'"
      :description="description"
    />
    <Summary
      title="Calendar"
      icon="i-lucide-calendar"
      to="/workspace/property/calendar"
      :value="settled ? reservations.summary.value.occupiedNights : '—'"
      :pending="reservations.outcome.value === 'pending'"
      :error="reservations.outcome.value === 'error'"
      :description="calendarDescription"
    />
  </section>
</template>
<script setup lang="ts">
import { usePropertyScope } from 'fireux-properties/runtime/property/composables/usePropertyScope'
import { usePropertyWorkspace } from 'fireux-properties/runtime/property/composables/workspace/usePropertyWorkspace'

import { computed } from 'vue'
import Summary from 'fireux-core/runtime/workspace/components/Overview/Summary.vue'
import { usePropertyReservations } from '../../../composables/reservations/usePropertyReservations'
const reservations = usePropertyReservations(
  usePropertyScope(usePropertyWorkspace().id)
)
const settled = computed(
  () =>
    reservations.outcome.value === 'ready' ||
    reservations.outcome.value === 'empty'
)
const description = computed(() =>
  !settled.value
    ? ''
    : reservations.truncated.value
      ? 'Limited records loaded; this is not an availability check.'
      : `${reservations.summary.value.statuses.confirmed} confirmed · recorded stays, not an availability check`
)
const calendarDescription = computed(() =>
  !settled.value
    ? ''
    : reservations.truncated.value
      ? 'Recorded nights in a limited set of reservations; this is not an availability check.'
      : 'Recorded nights across non-cancelled reservations; this is not an availability check.'
)
</script>
