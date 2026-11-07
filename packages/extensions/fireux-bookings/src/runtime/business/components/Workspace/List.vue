<template>
  <UCard>
    <template #header>Customer bookings</template>
    <p v-if="!bookings.length">No bookings on this page.</p>
    <table v-else class="booking-list">
      <caption>
        Bookings shown in date order on this page
      </caption>
      <thead>
        <tr>
          <th>Date</th>
          <th>Service</th>
          <th>Guest</th>
          <th>Group</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id">
          <td>{{ booking.date }}<br />{{ booking.start_at }}</td>
          <td>
            {{ booking.service_name }}<br /><small>{{ booking.id }}</small>
          </td>
          <td>
            {{ booking.guest_name }}<br /><ULink
              :to="`mailto:${booking.guest_email}`"
              >{{ booking.guest_email }}</ULink
            >
          </td>
          <td>{{ booking.party_size }}</td>
          <td>{{ booking.currency }} {{ booking.total_price }}</td>
          <td>{{ booking.status }}</td>
        </tr>
      </tbody>
    </table>
  </UCard>
</template>
<script setup lang="ts">
import type { BusinessBooking } from '../../../models/business-bookings'
defineProps<{ bookings: BusinessBooking[] }>()
</script>
<style scoped>
.booking-list {
  width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
}
.booking-list th,
.booking-list td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid var(--ui-border);
}
</style>
