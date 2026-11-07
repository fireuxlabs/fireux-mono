<template>
  <UPage>
    <UPageHeader
      title="Booking simulator"
      description="Configure the input, then try the shared booking surface."
    />

    <UPageBody>
      <UPageSection title="Input">
        <UCard>
          <div class="booking-sandbox__configuration">
            <UFormField label="Booking title" name="bookingTitle">
              <UInput
                class="booking-sandbox__input"
                :model-value="serviceName"
                autocomplete="off"
                maxlength="100"
                required
                @update:model-value="updateServiceName"
              />
            </UFormField>
            <UFormField label="Description" name="description">
              <UInput
                class="booking-sandbox__input"
                :model-value="description"
                maxlength="200"
                @update:model-value="updateDescription"
              />
            </UFormField>
            <UFormField label="Confirm button" name="confirmLabel">
              <UInput
                class="booking-sandbox__input"
                :model-value="confirmLabel"
                maxlength="60"
                @update:model-value="updateConfirmLabel"
              />
            </UFormField>
            <UFormField label="Maximum group size" name="maxGroupSize">
              <UInput
                class="booking-sandbox__input"
                :model-value="maxGroupSize"
                type="number"
                min="1"
                max="50"
                step="1"
                @update:model-value="updateMaxGroupSize"
              />
            </UFormField>
          </div>
        </UCard>
      </UPageSection>

      <UPageSection title="Surface">
        <BookingsCustomerForm
          :title="serviceName.trim() || 'Your booking'"
          :description="description"
          :customer="customer"
          :availability="availabilityView"
          :confirmation="confirmation"
          :error="bookingError"
          :pending="bookingPending"
          :can-confirm="Boolean(serviceName.trim())"
          :confirm-label="confirmLabel || 'Confirm booking'"
          :max-group-size="maxGroupSize"
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
                  @update:model-value="clearAvailability"
                />
              </UFormField>
              <UFormField label="End time (your local time)" name="endAt">
                <UInput
                  class="booking-sandbox__input"
                  v-model="endAt"
                  type="datetime-local"
                  required
                  @update:model-value="clearAvailability"
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
        <UAlert
          v-if="historyError"
          color="error"
          title="Recent bookings could not be loaded"
          :description="historyError"
        />
        <p v-else-if="bookings.length === 0">No bookings yet.</p>
        <ul v-else class="booking-sandbox__history">
          <li v-for="booking in bookings" :key="booking.id">
            <UCard>
              <strong>{{ booking.summary }}</strong>
              <p>
                {{ formatTime(booking.startAt) }} –
                {{ formatTime(booking.endAt) }}
              </p>
              <p>Group of {{ booking.groupSize }} · {{ booking.guestEmail }}</p>
              <UBadge color="success" variant="subtle">Confirmed</UBadge>
            </UCard>
          </li>
        </ul>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import type {
  BookingAvailabilityView,
  BookingConfirmationView,
  BookingCustomerDetails,
} from 'fireux-bookings/runtime/types/customer-booking-form'

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
const description = ref('Choose a time and enter your details to book.')
const confirmLabel = ref('Confirm booking')
const maxGroupSize = ref(50)
const customer = ref<BookingCustomerDetails>({
  guestName: '',
  guestEmail: '',
  groupSize: 2,
})
const availability = ref<AvailabilityResult | null>(null)
const availabilityError = ref('')
const bookingResult = ref<SandboxBooking | null>(null)
const bookings = ref<SandboxBooking[]>([])
const bookingError = ref('')
const historyError = ref('')
const checking = ref(false)
const bookingPending = ref(false)

const availabilityView = computed<BookingAvailabilityView>(() => {
  if (checking.value) {
    return {
      status: 'pending',
      message: 'Checking this time against the sandbox calendar.',
    }
  }
  if (availabilityError.value) {
    return { status: 'error', message: availabilityError.value }
  }
  if (!availability.value) {
    return {
      status: 'idle',
      message: 'Choose a time, then check its availability.',
    }
  }
  return availability.value.available
    ? {
        status: 'available',
        message: 'This time is available. You can confirm the booking.',
      }
    : {
        status: 'unavailable',
        message: 'This time is unavailable. Choose another time.',
      }
})

const confirmation = computed<BookingConfirmationView | null>(() => {
  if (!bookingResult.value) return null
  return {
    title: 'Booking confirmed',
    message: `${bookingResult.value.summary} has been added to recent bookings.`,
    details: [
      {
        label: 'Time',
        value: `${formatTime(bookingResult.value.startAt)} – ${formatTime(bookingResult.value.endAt)}`,
      },
      { label: 'Group', value: String(bookingResult.value.groupSize) },
      { label: 'Email', value: bookingResult.value.guestEmail },
    ],
  }
})

function clearAvailability() {
  availability.value = null
  availabilityError.value = ''
  clearBookingResult()
}

function clearBookingResult() {
  bookingResult.value = null
  bookingError.value = ''
}

function updateCustomer(value: BookingCustomerDetails) {
  customer.value = value
  clearBookingResult()
}

function updateServiceName(value: unknown) {
  serviceName.value = typeof value === 'string' ? value : ''
  clearBookingResult()
}

function updateDescription(value: unknown) {
  description.value = typeof value === 'string' ? value : ''
  clearBookingResult()
}

function updateConfirmLabel(value: unknown) {
  confirmLabel.value = typeof value === 'string' ? value : ''
  clearBookingResult()
}

function updateMaxGroupSize(value: unknown) {
  const next = Number(value)
  if (Number.isInteger(next)) {
    maxGroupSize.value = Math.min(50, Math.max(1, next))
    clearBookingResult()
  }
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
    historyError.value = ''
  } catch {
    historyError.value = 'Could not load recent bookings.'
  }
}

async function checkAvailability() {
  checking.value = true
  availabilityError.value = ''
  clearBookingResult()
  try {
    availability.value = await $fetch<AvailabilityResult>(
      '/api/sandbox/bookings/availability',
      { query: toUtcRange() }
    )
  } catch (error) {
    availability.value = null
    availabilityError.value = messageFromError(
      error,
      'Could not check availability. Try again.'
    )
  } finally {
    checking.value = false
  }
}

async function submitBooking(details: BookingCustomerDetails) {
  if (!availability.value?.available || !serviceName.value.trim()) return
  bookingPending.value = true
  bookingError.value = ''
  try {
    const response = await $fetch<{ booking: SandboxBooking }>(
      '/api/sandbox/bookings',
      {
        method: 'POST',
        body: {
          serviceName: serviceName.value,
          ...details,
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
    bookingError.value = messageFromError(
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
.booking-sandbox__configuration,
.booking-sandbox__time-fields {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.booking-sandbox__configuration {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.booking-sandbox__configuration :deep(.booking-sandbox__input) {
  width: 100%;
}

.booking-sandbox__time-fields {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.booking-sandbox__time-fields :deep(.booking-sandbox__input) {
  width: 100%;
}

.booking-sandbox__history {
  display: grid;
  gap: calc(var(--spacing) * 4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.booking-sandbox__history p {
  margin-top: calc(var(--spacing) * 2);
}

@media (max-width: 38rem) {
  .booking-sandbox__configuration,
  .booking-sandbox__time-fields {
    grid-template-columns: 1fr;
  }
}
</style>
