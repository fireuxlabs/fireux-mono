<template>
  <div class="booking-review">
    <BookingPeriod :start-at="slot.startAt" :end-at="slot.endAt" />
    <dl>
      <dt>Name</dt>
      <dd>{{ contact.name }}</dd>
      <dt>Email</dt>
      <dd>{{ contact.email }}</dd>
    </dl>
    <UAlert
      v-if="error"
      color="error"
      title="Booking could not be confirmed"
      :description="error"
    />
    <div class="booking-review__actions">
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        @click="$emit('back')"
        >Back</UButton
      >
      <UButton :loading="pending" :disabled="pending" @click="$emit('confirm')"
        >Confirm booking</UButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import BookingPeriod from './Period.vue'
import type { BookingContact, BookingSlot } from '../types/booking-surface'
defineProps<{
  slot: BookingSlot
  contact: BookingContact
  pending: boolean
  error: string
}>()
defineEmits<{ back: []; confirm: [] }>()
</script>

<style scoped>
.booking-review {
  display: grid;
  gap: calc(var(--spacing) * 5);
}
.booking-review dt {
  color: var(--ui-text-muted);
}
.booking-review dd {
  margin: 0 0 calc(var(--spacing) * 3);
  overflow-wrap: anywhere;
}
.booking-review__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
</style>
