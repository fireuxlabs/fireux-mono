<template>
  <UAlert
    v-if="error"
    color="error"
    title="Recent bookings could not be loaded"
    :description="error"
  />
  <p v-else-if="bookings.length === 0">No bookings yet.</p>
  <ul v-else class="booking-sandbox-history">
    <li v-for="booking in bookings" :key="booking.id">
      <UCard>
        <strong>{{ booking.summary }}</strong>
        <p>
          {{ formatBookingSandboxTime(booking.startAt) }} –
          {{ formatBookingSandboxTime(booking.endAt) }}
        </p>
        <p>Group of {{ booking.groupSize }} · {{ booking.guestEmail }}</p>
        <UBadge color="success" variant="subtle">Confirmed</UBadge>
      </UCard>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SandboxBooking } from '~/models/booking-sandbox'
import { formatBookingSandboxTime } from '~/utils/booking-sandbox'

defineProps<{
  bookings: SandboxBooking[]
  error: string
}>()
</script>

<style scoped>
.booking-sandbox-history {
  display: grid;
  gap: calc(var(--spacing) * 4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.booking-sandbox-history p {
  margin-top: calc(var(--spacing) * 2);
}
</style>
