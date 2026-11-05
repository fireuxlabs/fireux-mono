<script setup lang="ts">
import { tours } from '~/content/tours'

definePageMeta({ layout: 'tours' })

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
  tours.some((tour) => tour.slug === routeTour) ? routeTour : tours[0].slug
)
const selectedTour = computed(
  () => tours.find((tour) => tour.slug === selectedTourSlug.value) ?? tours[0]
)
const date = ref('')
const guestName = ref('')
const guestEmail = ref('')
const groupSize = ref(2)
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
  () => selectedTour.value.price * Number(groupSize.value || 0)
)
const confirmationTime = computed(() => {
  if (!confirmation.value) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: confirmation.value.timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(confirmation.value.startAt))
})

watch(
  [selectedTourSlug, date, availabilityRevision],
  ([tourSlug, selectedDate], _previous, onCleanup) => {
    const requestId = ++availabilityRequest
    availability.value = null
    availabilityError.value = ''
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

async function submitBooking() {
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
          guestName: guestName.value,
          guestEmail: guestEmail.value,
          groupSize: groupSize.value,
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

<template>
  <div class="wrap section booking-page">
    <NuxtLink to="/#tours" class="back-link">← All private tours</NuxtLink>

    <template v-if="confirmation">
      <section class="booking-confirmation" aria-live="polite">
        <p class="eyebrow">Booking confirmed</p>
        <h1>Your ride is on.</h1>
        <p>
          {{ confirmation.tourName }} is booked for {{ confirmation.date }} at
          {{ confirmationTime }} in Interlaken.
        </p>
        <dl class="booking-confirmation-details">
          <div>
            <dt>Group</dt>
            <dd>{{ confirmation.groupSize }} people</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>CHF {{ confirmation.totalPriceChf }}</dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>{{ confirmation.id }}</dd>
          </div>
        </dl>
        <p class="booking-note">
          A copy of this confirmation is shown here. Ben’s calendar has been
          updated with the booking details.
        </p>
        <UButton to="/" size="lg" trailing-icon="i-lucide-arrow-up-right">
          Back to the tours
        </UButton>
      </section>
    </template>

    <template v-else>
      <div class="booking-heading">
        <p class="eyebrow">Private guided rides · Interlaken</p>
        <h1>Choose your ride.</h1>
        <p>
          Pick a tour and date. You’ll see the fixed price before you confirm.
        </p>
      </div>

      <form class="booking-form" @submit.prevent="submitBooking">
        <UFormField label="Private tour" name="tour">
          <select v-model="selectedTourSlug" class="native-select" required>
            <option v-for="tour in tours" :key="tour.slug" :value="tour.slug">
              {{ tour.name }} · CHF {{ tour.price }} per person
            </option>
          </select>
        </UFormField>

        <div class="booking-form-row">
          <UFormField label="Tour date" name="date">
            <UInput
              v-model="date"
              type="date"
              :min="minimumDate"
              required
              size="lg"
              class="form-control"
            />
          </UFormField>
          <UFormField label="People" name="groupSize">
            <UInput
              v-model="groupSize"
              type="number"
              min="1"
              max="50"
              required
              size="lg"
              class="form-control"
            />
          </UFormField>
        </div>

        <div class="booking-availability" aria-live="polite">
          <p v-if="!date">Choose a date to check availability.</p>
          <p v-else-if="availabilityPending">Checking availability…</p>
          <p v-else-if="availabilityError" role="alert">
            {{ availabilityError }}
          </p>
          <p v-else-if="availability?.available" class="booking-available">
            Available · {{ availability.departureTime }} ·
            {{ selectedTour.duration }}
          </p>
          <p v-else-if="availability?.reason === 'past'">
            This departure has already passed. Choose another date.
          </p>
          <p v-else-if="availability?.reason === 'closed'">
            This date is closed. Choose another date.
          </p>
          <p v-else-if="availability">
            This date is already booked. Choose another date.
          </p>
        </div>

        <UFormField label="Your name" name="guestName">
          <UInput
            v-model="guestName"
            autocomplete="name"
            maxlength="100"
            required
            size="lg"
            class="form-control"
          />
        </UFormField>
        <UFormField label="Email address" name="guestEmail">
          <UInput
            v-model="guestEmail"
            type="email"
            autocomplete="email"
            maxlength="254"
            required
            size="lg"
            class="form-control"
          />
        </UFormField>

        <div class="booking-price" aria-live="polite">
          <span>CHF {{ selectedTour.price }} per person</span>
          <strong>CHF {{ totalPrice }} total</strong>
        </div>

        <p v-if="bookingError" class="booking-error" role="alert">
          {{ bookingError }}
        </p>
        <UButton
          type="submit"
          size="xl"
          block
          :disabled="!availability?.available || bookingPending"
          :loading="bookingPending"
          trailing-icon="i-lucide-arrow-up-right"
        >
          Confirm private tour
        </UButton>
        <p class="booking-note">
          No payment is collected here. Your tour is confirmed as soon as the
          booking is saved and added to Ben’s calendar.
        </p>
      </form>
    </template>
  </div>
</template>
