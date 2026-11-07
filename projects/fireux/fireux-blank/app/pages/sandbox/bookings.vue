<template>
  <UPage>
    <UPageHeader
      title="Booking simulator"
      description="Configure the input, then try the shared booking surface."
    />

    <UPageBody>
      <UPageSection title="Input">
        <BookingSandboxConfiguration v-model="configuration" />
      </UPageSection>

      <UPageSection title="Surface">
        <BookingsCustomerForm
          :title="configuration.serviceName.trim() || 'Your booking'"
          :description="configuration.description"
          :customer="customer"
          :availability="availabilityView"
          :confirmation="confirmation"
          :error="bookingError"
          :pending="bookingPending"
          :can-confirm="canConfirm"
          :confirm-label="configuration.confirmLabel || 'Confirm booking'"
          :max-group-size="configuration.maxGroupSize"
          @update:customer="updateCustomer"
          @submit="submitBooking"
        >
          <template #reservation>
            <div class="booking-sandbox__time-fields">
              <UFormField label="Start time (your local time)" name="startAt">
                <UInput
                  class="booking-sandbox__input"
                  v-model="startAt"
                  type="datetime-local"
                  required
                />
              </UFormField>
              <UFormField label="End time (your local time)" name="endAt">
                <UInput
                  class="booking-sandbox__input"
                  v-model="endAt"
                  type="datetime-local"
                  required
                />
              </UFormField>
            </div>
          </template>

          <template #availability-actions>
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              :loading="checking"
              :disabled="checking || bookingPending"
              @click="checkAvailability"
            >
              Check availability
            </UButton>
          </template>
        </BookingsCustomerForm>
      </UPageSection>

      <UPageSection title="Recent bookings">
        <BookingSandboxRecentBookings
          :bookings="bookings"
          :error="historyError"
        />
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const {
  startAt,
  endAt,
  configuration,
  customer,
  availabilityView,
  confirmation,
  canConfirm,
  bookings,
  bookingError,
  historyError,
  checking,
  bookingPending,
  checkAvailability,
  updateCustomer,
  submitBooking,
} = useBookingSandbox()

definePageMeta({ layout: false })
useSeoMeta({
  title: 'Booking simulator — FireUX Blank',
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.booking-sandbox__time-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}

.booking-sandbox__input {
  width: 100%;
}

@media (max-width: 38rem) {
  .booking-sandbox__time-fields {
    grid-template-columns: 1fr;
  }
}
</style>
