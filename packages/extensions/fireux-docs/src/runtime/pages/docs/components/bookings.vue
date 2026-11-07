<template>
  <UPage>
    <UPageHeader
      title="Reusable booking form"
      headline="Bookings Extension"
      description="A shared customer-facing form. The consuming App supplies the service, schedule, availability and booking command."
    />
    <UPageBody>
      <UPageSection title="Live preview">
        <BookingsCustomerForm
          eyebrow="Sample appointment"
          title="Book a session."
          description="Choose a sample service and time, then enter customer details."
          :customer="customer"
          :availability="availability"
          :confirmation="confirmation"
          confirm-label="Confirm sample booking"
          @update:customer="customer = $event"
          @submit="confirmSample"
        >
          <template #reservation>
            <UFormField label="Service" name="service">
              <USelect
                class="booking-preview__input"
                v-model="service"
                :items="services"
              />
            </UFormField>
            <div class="booking-preview__schedule">
              <UFormField label="Date" name="date">
                <UInput
                  class="booking-preview__input"
                  v-model="date"
                  type="date"
                  required
                />
              </UFormField>
              <UFormField label="Start time" name="time">
                <UInput
                  class="booking-preview__input"
                  v-model="time"
                  type="time"
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
              :disabled="!date || !time"
              @click="checkSampleAvailability"
            >
              Check sample availability
            </UButton>
          </template>

          <template #summary>
            <p class="booking-preview__summary">
              {{ service }} · 45 minutes · sample selection
            </p>
          </template>
        </BookingsCustomerForm>
      </UPageSection>

      <UPageSection title="Ownership">
        <p>
          The form owns customer name, email, group size, availability status,
          and confirmation presentation. A consuming App owns its catalogue,
          date and time rules, price, provider, records and booking policy.
        </p>
        <p>
          The preview uses local placeholder data and does not call a booking
          service. See the
          <ULink
            to="https://github.com/fireuxlabs/fireux-mono/tree/main/packages/extensions/fireux-bookings"
            target="_blank"
          >
            Bookings package source and documentation
          </ULink>
          for the component contract and lifecycle boundaries.
        </p>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BookingsCustomerForm from 'fireux-bookings/runtime/components/Customer/Form.vue'
import type {
  BookingAvailabilityView,
  BookingConfirmationView,
  BookingCustomerDetails,
} from 'fireux-bookings/runtime/types/customer-booking-form'

const services = ['Product consultation', 'Planning session']
const service = ref(services[0])
const date = ref('')
const time = ref('')
const customer = ref<BookingCustomerDetails>({
  guestName: '',
  guestEmail: '',
  groupSize: 1,
})
const availability = ref<BookingAvailabilityView>({
  status: 'idle',
  message: 'Choose a date and time, then check sample availability.',
})
const confirmation = ref<BookingConfirmationView | null>(null)

watch([service, date, time], () => {
  confirmation.value = null
  availability.value = {
    status: 'idle',
    message: 'Choose a date and time, then check sample availability.',
  }
})

function checkSampleAvailability() {
  if (!date.value || !time.value) return
  confirmation.value = null
  availability.value = {
    status: 'available',
    message: `${date.value} at ${time.value} is available in this sample preview.`,
  }
}

function confirmSample(details: BookingCustomerDetails) {
  confirmation.value = {
    eyebrow: 'Sample confirmation',
    title: 'Booking confirmed.',
    message: 'This local preview demonstrates the shared confirmation state.',
    details: [
      { label: 'Service', value: service.value },
      { label: 'Date and time', value: `${date.value} · ${time.value}` },
      { label: 'Guest', value: details.guestName },
      { label: 'Group', value: String(details.groupSize) },
    ],
  }
}

definePageMeta({ layout: 'docs', title: 'Reusable booking form' })
useSeoMeta({
  title: 'Reusable booking form · FireUX',
  description:
    'Preview the provider-independent FireUX Bookings customer form with placeholder data.',
})
</script>

<style scoped>
.booking-preview__schedule {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}

.booking-preview__input {
  width: 100%;
}

.booking-preview__summary {
  color: var(--ui-text-muted);
}

@media (max-width: 38rem) {
  .booking-preview__schedule {
    grid-template-columns: 1fr;
  }
}
</style>
