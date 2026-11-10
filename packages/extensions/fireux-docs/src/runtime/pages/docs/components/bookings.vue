<template>
  <UPage>
    <UPageHeader
      title="Booking surface"
      headline="Bookings Extension"
      description="Choose a time, enter your details, review and confirm."
    />
    <UPageBody>
      <UPageSection title="Preview">
        <BookingsSurface :configuration="configuration" :confirm="confirm" />
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import BookingsSurface from 'fireux-bookings/runtime/components/Surface.vue'
import type {
  BookingConfiguration,
  BookingConfirmationHandler,
} from 'fireux-bookings/runtime/types/booking-surface'
const configuration: BookingConfiguration = {
  title: 'Sample booking',
  slots: [
    { id: 'one', startAt: '2030-06-15T09:00', endAt: '2030-06-15T10:00' },
    { id: 'two', startAt: '2030-06-15T14:00', endAt: '2030-06-15T15:00' },
  ],
}
const confirm: BookingConfirmationHandler = async (submission) => ({
  reference: `SAMPLE-${submission.requestId.slice(0, 8)}`,
})
definePageMeta({ layout: 'docs', title: 'Booking surface' })
useSeoMeta({
  title: 'Booking surface · FireUX',
  description: 'Try the shared FireUX booking flow with placeholder data.',
})
</script>
