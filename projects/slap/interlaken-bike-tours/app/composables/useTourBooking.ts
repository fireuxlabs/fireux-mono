import type {
  BookingConfiguration,
  BookingConfirmationHandler,
} from 'fireux-bookings/runtime/types/booking-surface'
import { tours } from '~/content/tours'

type TourAvailability = {
  available: boolean
  availabilityRevision: number
  reason?: 'closed' | 'past' | 'booked' | 'calendar-busy'
  startAt: string
  endAt: string
  timeZone: string
}

export function useTourBooking() {
  const route = useRoute()
  const tourSlug = ref(
    tours.find((tour) => tour.slug === route.query.tour)?.slug ?? tours[0].slug
  )
  const date = ref('')
  const requestedPeople =
    typeof route.query.people === 'string' ? Number(route.query.people) : NaN
  const groupSize = ref(
    Number.isSafeInteger(requestedPeople) &&
      requestedPeople >= 1 &&
      requestedPeople <= 50
      ? requestedPeople
      : 2
  )
  const tour = computed(
    () => tours.find((tour) => tour.slug === tourSlug.value) ?? tours[0]
  )
  const minimumDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const query = computed(() => ({ tour: tourSlug.value, date: date.value }))
  const { data, status, error, execute, clear } = useFetch<TourAvailability>(
    '/api/bookings/availability',
    {
      query,
      immediate: false,
      watch: false,
      server: false,
    }
  )
  watch(query, () => {
    clear()
    if (date.value) void execute()
  })
  const validGroup = computed(
    () =>
      Number.isSafeInteger(Number(groupSize.value)) &&
      Number(groupSize.value) >= 1 &&
      Number(groupSize.value) <= 50
  )
  const total = computed(() => tour.value.price * Number(groupSize.value || 0))
  const message = computed(() => {
    if (!date.value) return 'Choose a date to see the departure time.'
    if (status.value === 'pending') return 'Checking tour availability…'
    if (error.value)
      return 'Availability is temporarily unavailable. Please contact Ben or choose another date.'
    if (!data.value?.available)
      return 'This date is unavailable. Choose another date.'
    if (!validGroup.value) return 'Choose a group size between 1 and 50.'
    return `Departure times are shown in ${data.value.timeZone}.`
  })
  const configuration = computed<BookingConfiguration>(() => ({
    title: tour.value.name,
    slots:
      status.value === 'success' && data.value?.available && validGroup.value
        ? [
            {
              id: `${tourSlug.value}:${date.value}:${groupSize.value}:${data.value.availabilityRevision}`,
              startAt: data.value.startAt.slice(0, 16),
              endAt: data.value.endAt.slice(0, 16),
            },
          ]
        : [],
  }))
  const confirm = computed<BookingConfirmationHandler>(() => {
    const offer = configuration.value
    const selectedTour = tourSlug.value
    const selectedDate = date.value
    const selectedGroup = Number(groupSize.value)
    const revision = data.value?.availabilityRevision
    // Retain an uncertain submission for this offer: the existing server does not
    // yet support durable request-id replay, so never silently resubmit it.
    let submission: Promise<{ reference: string }> | undefined
    let submittedRequestId: string | undefined
    return (input) => {
      if (!offer.slots.some((slot) => slot.id === input.slotId))
        throw new Error('Choose an available departure.')
      if (submittedRequestId && submittedRequestId !== input.requestId)
        throw new Error(
          'A request for this departure has already been sent. Please contact Ben before booking again.'
        )
      submittedRequestId = input.requestId
      submission ??= $fetch<{ booking: { id: string } }>('/api/bookings', {
        method: 'POST',
        body: {
          tourSlug: selectedTour,
          date: selectedDate,
          groupSize: selectedGroup,
          availabilityRevision: revision,
          guestName: input.contact.name,
          guestEmail: input.contact.email,
        },
      })
        .then((result) => ({ reference: result.booking.id }))
        .catch(() => {
          throw new Error(
            'We could not verify confirmation. Please contact Ben before trying again; your request may have been received.'
          )
        })
      return submission
    }
  })
  return {
    tourSlug,
    date,
    groupSize,
    tour,
    minimumDate,
    total,
    message,
    configuration,
    confirm,
  }
}
