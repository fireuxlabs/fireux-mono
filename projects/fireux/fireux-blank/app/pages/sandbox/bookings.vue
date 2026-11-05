<template>
  <main class="booking-sandbox">
    <UPageHeader
      title="Booking simulator"
      description="Set an input, then try the booking surface."
    />

    <section class="simulator-inputs" aria-labelledby="simulator-inputs-title">
      <h2 id="simulator-inputs-title">Input</h2>
      <p>Set the booking title that appears on the surface below.</p>
      <label>
        Booking title
        <input
          v-model="serviceName"
          autocomplete="off"
          maxlength="100"
          required
          @input="clearBookingResult"
        />
      </label>
    </section>

    <section class="booking-surface" aria-labelledby="booking-surface-title">
      <h2 id="booking-surface-title">Surface</h2>
      <div class="surface-card">
        <header class="surface-intro">
          <p>Booking</p>
          <h3>{{ serviceName.trim() || 'Your private tour' }}</h3>
          <p>Choose a time and enter your details to book.</p>
        </header>

        <form class="sandbox-form" @submit.prevent="submitBooking">
          <label>
            Guest name
            <input
              v-model="guestName"
              autocomplete="name"
              maxlength="100"
              placeholder="Your name"
              required
              @input="clearBookingResult"
            />
          </label>

          <label>
            Guest email
            <input
              v-model="guestEmail"
              type="email"
              autocomplete="email"
              maxlength="254"
              placeholder="you@example.com"
              required
              @input="clearBookingResult"
            />
          </label>

          <label>
            Group size
            <input
              v-model.number="groupSize"
              type="number"
              min="1"
              max="50"
              step="1"
              required
              @input="clearBookingResult"
            />
          </label>

          <div class="sandbox-time-grid">
            <label>
              Start time (your local time)
              <input v-model="startAt" type="datetime-local" required @input="clearAvailability" />
            </label>
            <label>
              End time (your local time)
              <input v-model="endAt" type="datetime-local" required @input="clearAvailability" />
            </label>
          </div>

          <div class="sandbox-actions">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              :loading="checking"
              @click="checkAvailability"
            >
              Check availability
            </UButton>
            <UButton
              type="submit"
              :disabled="!availability?.available || checking || bookingPending || !serviceName.trim()"
              :loading="bookingPending"
            >
              Confirm booking
            </UButton>
          </div>
        </form>

        <UAlert
          v-if="availability && !bookingResult"
          class="sandbox-result"
          :title="availability.available ? 'Time is available' : 'Time is busy'"
          :description="availability.available
            ? 'This time is available. Confirm your booking to continue.'
            : 'This time is unavailable. Choose another time.'"
          :color="availability.available ? 'success' : 'warning'"
        />

        <UAlert
          v-if="bookingResult"
          class="sandbox-result"
          title="Booking confirmed"
          :description="`${bookingResult.summary} · group of ${bookingResult.groupSize} · ${bookingResult.guestEmail}`"
          color="success"
        />

        <UAlert
          v-if="errorMessage"
          class="sandbox-result"
          title="Booking could not be completed"
          :description="errorMessage"
          color="error"
        />
      </div>

      <section class="sandbox-history" aria-labelledby="sandbox-history-title">
        <h3 id="sandbox-history-title">Recent bookings</h3>
        <p v-if="bookings.length === 0">No bookings yet.</p>
        <ul v-else>
          <li v-for="booking in bookings" :key="booking.id">
            <strong>{{ booking.summary }}</strong>
            <span>{{ formatTime(booking.startAt) }} – {{ formatTime(booking.endAt) }}</span>
            <span>Group of {{ booking.groupSize }} · {{ booking.guestEmail }}</span>
            <span>Confirmed</span>
          </li>
        </ul>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
type SandboxBooking = {
  id: string
  serviceName: string
  guestName: string
  guestEmail: string
  groupSize: number
  summary: string
  startAt: string
  endAt: string
  status: 'confirmed'
  calendarEventId: string
}

type AvailabilityResult = {
  available: boolean
  busy: Array<{ start: string; end: string }>
}

if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Not found.' })
}

definePageMeta({ layout: false })
useSeoMeta({
  title: 'Booking simulator — FireUX Blank',
  robots: 'noindex, nofollow',
})

function toLocalInputValue(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return adjusted.toISOString().slice(0, 16)
}

const startAt = ref(toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)))
const endAt = ref(toLocalInputValue(new Date(Date.now() + 2 * 60 * 60 * 1000)))
const serviceName = ref('Private Tour')
const guestName = ref('')
const guestEmail = ref('')
const groupSize = ref(2)
const availability = ref<AvailabilityResult | null>(null)
const bookingResult = ref<SandboxBooking | null>(null)
const bookings = ref<SandboxBooking[]>([])
const errorMessage = ref('')
const checking = ref(false)
const bookingPending = ref(false)

function clearAvailability() {
  availability.value = null
  clearBookingResult()
}

function clearBookingResult() {
  bookingResult.value = null
  errorMessage.value = ''
}

function toUtcRange() {
  if (!startAt.value || !endAt.value) {
    throw new Error('Choose both a start and end time.')
  }
  const start = new Date(startAt.value)
  const end = new Date(endAt.value)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw new Error('Choose valid start and end times.')
  }
  return { startAt: start.toISOString(), endAt: end.toISOString() }
}

function messageFromError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = error.data
    if (
      typeof data === 'object' &&
      data !== null &&
      'statusMessage' in data &&
      typeof data.statusMessage === 'string'
    ) {
      return data.statusMessage
    }
  }
  return fallback
}

async function refreshBookings() {
  try {
    const response = await $fetch<{ bookings: SandboxBooking[] }>(
      '/api/sandbox/bookings'
    )
    bookings.value = response.bookings
  } catch {
    errorMessage.value = 'Could not load recent bookings.'
  }
}

async function checkAvailability() {
  checking.value = true
  errorMessage.value = ''
  bookingResult.value = null
  try {
    availability.value = await $fetch<AvailabilityResult>(
      '/api/sandbox/bookings/availability',
      { query: toUtcRange() }
    )
  } catch (error) {
    availability.value = null
    errorMessage.value = messageFromError(
      error,
      'Could not check availability. Try again.'
    )
  } finally {
    checking.value = false
  }
}

async function submitBooking() {
  if (!availability.value?.available) return
  bookingPending.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch<{ booking: SandboxBooking }>(
      '/api/sandbox/bookings',
      {
        method: 'POST',
        body: {
          serviceName: serviceName.value,
          guestName: guestName.value,
          guestEmail: guestEmail.value,
          groupSize: groupSize.value,
          ...toUtcRange(),
        },
      }
    )
    bookingResult.value = response.booking
    bookings.value = [response.booking, ...bookings.value]
    availability.value = {
      available: false,
      busy: [{ start: response.booking.startAt, end: response.booking.endAt }],
    }
  } catch (error) {
    errorMessage.value = messageFromError(
      error,
      'Could not complete the booking. Try again.'
    )
  } finally {
    bookingPending.value = false
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

onMounted(refreshBookings)
</script>

<style scoped>
.booking-sandbox {
  max-width: 54rem;
  margin: 2.5rem auto;
  padding: 0 1.25rem 3rem;
}

.simulator-inputs,
.surface-card,
.sandbox-result {
  margin-top: 1.25rem;
}

.simulator-inputs,
.surface-card {
  padding: 1.5rem;
  border: 1px solid #d6d8d5;
  border-radius: 0.75rem;
  background: #fff;
}

.simulator-inputs h2,
.surface-card h3 {
  color: #15201d;
}

.simulator-inputs > p,
.surface-intro {
  color: #3c4843;
}

.simulator-inputs label,
.sandbox-form label {
  display: grid;
  gap: 0.5rem;
  font-weight: 600;
  color: #15201d;
}

.simulator-inputs label {
  max-width: 32rem;
  margin-top: 1.25rem;
}

.simulator-inputs input,
.sandbox-form input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #a9aeaa;
  border-radius: 0.4rem;
  background: #fff;
  color: #15201d;
  font: inherit;
}

.sandbox-time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.sandbox-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.booking-surface {
  margin-top: 2rem;
}

.surface-intro > p:first-child {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.surface-intro h3 {
  margin: 0.35rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.surface-intro > p:last-child {
  margin-bottom: 0;
}

.sandbox-form {
  display: grid;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.sandbox-history {
  margin-top: 2rem;
}

.sandbox-history h3 {
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: inherit;
}

.sandbox-history ul {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sandbox-history li {
  display: grid;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  border: 1px solid #d6d8d5;
  border-radius: 0.5rem;
  background: #fff;
  color: #15201d;
}

@media (max-width: 38rem) {
  .sandbox-time-grid {
    grid-template-columns: 1fr;
  }
}
</style>
