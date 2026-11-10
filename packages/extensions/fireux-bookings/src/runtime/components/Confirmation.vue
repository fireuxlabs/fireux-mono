<template>
  <div class="booking-confirmation" role="status">
    <UAlert
      color="success"
      icon="i-lucide-check"
      title="Booking confirmed"
      :description="`Reference: ${booking.receipt.reference}`"
    />
    <BookingPeriod
      :start-at="booking.slot.startAt"
      :end-at="booking.slot.endAt"
    />
    <p>Booked for {{ booking.contact.name }} · {{ booking.contact.email }}</p>
    <UButton color="neutral" variant="outline" @click="$emit('restart')"
      >Make another booking</UButton
    >
  </div>
</template>

<script setup lang="ts">
import BookingPeriod from './Period.vue'
import type { ConfirmedBooking } from '../types/booking-surface'
defineProps<{ booking: ConfirmedBooking }>()
defineEmits<{ restart: [] }>()
</script>

<style scoped>
.booking-confirmation {
  display: grid;
  gap: calc(var(--spacing) * 5);
  overflow-wrap: anywhere;
}
</style>
