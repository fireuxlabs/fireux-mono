<template>
  <UPage>
    <UButton to="/#tours" variant="link" color="neutral"
      >All private tours</UButton
    >

    <BookingsCustomerForm
      eyebrow="Private guided rides · Interlaken"
      :heading-level="1"
      title="Choose your ride."
      description="Pick a tour and date. You’ll see the fixed price before you confirm."
      :customer="customer"
      :availability="availabilityView"
      :confirmation="confirmationView"
      :error="bookingError"
      :pending="bookingPending"
      confirm-label="Confirm private tour"
      @update:customer="customer = $event"
      @submit="submitBooking"
    >
      <template #reservation>
        <UFormField label="Private tour" name="tour">
          <USelect
            class="booking-input"
            v-model="selectedTourSlug"
            :items="
              tours.map((tour) => ({
                label: `${tour.name} · CHF ${tour.price} per person`,
                value: tour.slug,
              }))
            "
            required
          />
        </UFormField>
        <UFormField label="Tour date" name="date">
          <UInput
            class="booking-input"
            v-model="date"
            type="date"
            :min="minimumDate"
            required
            size="lg"
          />
        </UFormField>
      </template>

      <template #summary>
        <div class="booking-price" aria-live="polite">
          <span>CHF {{ selectedTour.price }} per person</span>
          <strong>CHF {{ totalPrice }} total</strong>
        </div>
      </template>

      <template #footnote>
        <p class="booking-note">
          No payment is collected here. Your tour is confirmed as soon as the
          booking is saved and added to the calendar.
        </p>
      </template>

      <template #confirmation-actions>
        <UButton to="/" size="lg" trailing-icon="i-lucide-arrow-up-right">
          Back to the tours
        </UButton>
      </template>
    </BookingsCustomerForm>
  </UPage>
</template>

<script setup lang="ts">
import type {
  BookingAvailabilityView,
  BookingConfirmationView,
  BookingCustomerDetails,
} from 'fireux-bookings/runtime/types/customer-booking-form'
import { tours } from '~/content/tours'

type TourAvailability = {
  available: boolean
  availabilityRevision: number
  reason?: 'closed' | 'past' | 'booked' | 'calendar-busy'
  tourName: string
  date: string
  departureTime: string
  timeZone: string
  startAt: string
  endAt: string
  unitPriceChf: number
}

type TourBookingConfirmation = {
  id: string
  tourName: string
  date: string
  departureTime: string
  timeZone: string
  startAt: string
  groupSize: number
  unitPriceChf: number
  totalPriceChf: number
  currency: 'CHF'
  status: 'confirmed'
}

const route = useRoute()
const routeTour = typeof route.query.tour === 'string' ? route.query.tour : ''
const selectedTourSlug = ref(
  tours.find((tour) => tour.slug === routeTour)?.slug ?? tours[0].slug
)
const selectedTour = computed(
  () => tours.find((tour) => tour.slug === selectedTourSlug.value) ?? tours[0]
)
const date = ref('')
const customer = ref<BookingCustomerDetails>({
  guestName: '',
  guestEmail: '',
  groupSize: 2,
})
const availability = ref<TourAvailability | null>(null)
const availabilityPending = ref(false)
const availabilityError = ref('')
const bookingPending = ref(false)
const bookingError = ref('')
const confirmation = ref<TourBookingConfirmation | null>(null)
const availabilityRevision = ref(0)
let availabilityRequest = 0

const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Zurich',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
  .formatToParts(new Date())
  .reduce<Record<string, string>>((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value
    return result
  }, {})
const minimumDate = `${today.year}-${today.month}-${today.day}`
const totalPrice = computed(
  () => selectedTour.value.price * Number(customer.value.groupSize || 0)
)
const availabilityView = computed<BookingAvailabilityView>(() => {
  if (availabilityPending.value) {
    return {
      status: 'pending',
      message: 'Checking availability for this tour date.',
    }
  }
  if (availabilityError.value) {
    return { status: 'error', message: availabilityError.value }
  }
  if (!date.value) {
    return { status: 'idle', message: 'Choose a date to check availability.' }
  }
  if (!availability.value) {
    return { status: 'idle', message: 'Availability has not been checked yet.' }
  }
  if (availability.value.available) {
    return {
      status: 'available',
      message: `${availability.value.departureTime} · ${selectedTour.value.duration}`,
    }
  }

  const message = {
    past: 'This departure has already passed. Choose another date.',
    closed: 'This date is closed. Choose another date.',
    booked: 'This date is already booked. Choose another date.',
    'calendar-busy': 'The calendar is busy at this time. Choose another date.',
  }[availability.value.reason ?? 'booked']
  return { status: 'unavailable', message }
})
const confirmationView = computed<BookingConfirmationView | null>(() => {
  if (!confirmation.value) return null
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: confirmation.value.timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(confirmation.value.startAt))
  return {
    eyebrow: 'Booking confirmed',
    title: 'Your ride is on.',
    message: `${confirmation.value.tourName} is booked for ${confirmation.value.date} at ${time} in Interlaken.`,
    details: [
      { label: 'Group', value: `${confirmation.value.groupSize} people` },
      { label: 'Total', value: `CHF ${confirmation.value.totalPriceChf}` },
      { label: 'Reference', value: confirmation.value.id },
    ],
  }
})

watch(
  [selectedTourSlug, date, availabilityRevision],
  ([tourSlug, selectedDate], _previous, onCleanup) => {
    const requestId = ++availabilityRequest
    availability.value = null
    availabilityError.value = ''
    availabilityPending.value = false
    if (import.meta.server || !selectedDate) return

    const controller = new AbortController()
    onCleanup(() => controller.abort())
    availabilityPending.value = true
    void $fetch<TourAvailability>('/api/bookings/availability', {
      query: { tour: tourSlug, date: selectedDate },
      signal: controller.signal,
    })
      .then((result) => {
        if (requestId === availabilityRequest) availability.value = result
      })
      .catch(() => {
        if (requestId === availabilityRequest) {
          availabilityError.value =
            'Availability is temporarily unavailable. Please try again or contact Ben.'
        }
      })
      .finally(() => {
        if (requestId === availabilityRequest) availabilityPending.value = false
      })
  },
  { immediate: true }
)

async function submitBooking(details: BookingCustomerDetails) {
  bookingError.value = ''
  if (!availability.value?.available) {
    bookingError.value = 'Choose an available date before booking.'
    return
  }

  bookingPending.value = true
  try {
    const response = await $fetch<{ booking: TourBookingConfirmation }>(
      '/api/bookings',
      {
        method: 'POST',
        body: {
          tourSlug: selectedTourSlug.value,
          date: date.value,
          ...details,
          availabilityRevision: availability.value.availabilityRevision,
        },
      }
    )
    confirmation.value = response.booking
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode
    bookingError.value =
      statusCode === 409
        ? 'That date was just booked. Choose another available date.'
        : 'We could not confirm the booking. Please try again later.'
    availabilityRevision.value += 1
  } finally {
    bookingPending.value = false
  }
}
</script>

<style scoped>
.booking-input {
  width: 100%;
}
.booking-note {
  color: var(--ui-text-muted);
}
.booking-price {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
</style>
