import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import type {
  BookingAvailabilityView,
  BookingConfirmationView,
  BookingCustomerDetails,
} from 'fireux-bookings/runtime/types/customer-booking-form'
import type {
  SandboxAvailability,
  SandboxBooking,
  SandboxBookingConfiguration,
} from '~/models/booking-sandbox'
import { formatBookingSandboxTime } from '~/utils/booking-sandbox'

function toLocalInputValue(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return adjusted.toISOString().slice(0, 16)
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

export function useBookingSandbox() {
  const startAt = ref(toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)))
  const endAt = ref(toLocalInputValue(new Date(Date.now() + 2 * 60 * 60 * 1000)))
  const configuration = ref<SandboxBookingConfiguration>({
    serviceName: 'Private Tour',
    description: 'Choose a time and enter your details to book.',
    confirmLabel: 'Confirm booking',
    maxGroupSize: 50,
  })
  const customer = ref<BookingCustomerDetails>({
    guestName: '',
    guestEmail: '',
    groupSize: 2,
  })
  const availability = ref<SandboxAvailability | null>(null)
  const availabilityError = ref('')
  const bookingResult = ref<SandboxBooking | null>(null)
  const bookings = ref<SandboxBooking[]>([])
  const bookingError = ref('')
  const historyError = ref('')
  const checking = ref(false)
  const bookingPending = ref(false)
  let availabilityRequest = 0
  let availabilityController: AbortController | undefined

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
          value: `${formatBookingSandboxTime(bookingResult.value.startAt)} – ${formatBookingSandboxTime(bookingResult.value.endAt)}`,
        },
        { label: 'Group', value: String(bookingResult.value.groupSize) },
        { label: 'Email', value: bookingResult.value.guestEmail },
      ],
    }
  })

  const canConfirm = computed(() => Boolean(configuration.value.serviceName.trim()))

  function clearBookingResult() {
    bookingResult.value = null
    bookingError.value = ''
  }

  function clearAvailability() {
    availabilityRequest += 1
    availabilityController?.abort()
    availabilityController = undefined
    checking.value = false
    availability.value = null
    availabilityError.value = ''
    clearBookingResult()
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
    availabilityController?.abort()
    const controller = new AbortController()
    availabilityController = controller
    const request = ++availabilityRequest
    checking.value = true
    availabilityError.value = ''
    clearBookingResult()

    try {
      availability.value = await $fetch<SandboxAvailability>(
        '/api/sandbox/bookings/availability',
        { query: toUtcRange(), signal: controller.signal }
      )
    } catch (error) {
      if (controller.signal.aborted || request !== availabilityRequest) return
      availability.value = null
      availabilityError.value = messageFromError(
        error,
        'Could not check availability. Try again.'
      )
    } finally {
      if (request === availabilityRequest) checking.value = false
    }
  }

  function updateCustomer(value: BookingCustomerDetails) {
    customer.value = value
    clearBookingResult()
  }

  async function submitBooking(details: BookingCustomerDetails) {
    const serviceName = configuration.value.serviceName.trim()
    if (!availability.value?.available || !serviceName || bookingPending.value) {
      return
    }
    bookingPending.value = true
    bookingError.value = ''
    try {
      const response = await $fetch<{ booking: SandboxBooking }>(
        '/api/sandbox/bookings',
        {
          method: 'POST',
          body: { serviceName, ...details, ...toUtcRange() },
        }
      )
      bookingResult.value = response.booking
      bookings.value = [response.booking, ...bookings.value]
      availability.value = {
        available: false,
        busy: [
          { start: response.booking.startAt, end: response.booking.endAt },
        ],
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

  watch([startAt, endAt], clearAvailability)
  watch(configuration, clearBookingResult)
  onMounted(refreshBookings)
  onScopeDispose(() => availabilityController?.abort())

  return {
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
    clearAvailability,
    checkAvailability,
    updateCustomer,
    submitBooking,
  }
}
