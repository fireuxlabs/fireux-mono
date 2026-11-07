import { createError } from 'h3'
import type {
  GoogleCalendarBusyQuery,
  GoogleCalendarConnection,
  GoogleCalendarEventDraft,
  GoogleCalendarEventResult,
  GoogleCalendarInterval,
} from 'fireux-bookings/runtime/server/google-calendar'

type BookingSandboxRecord = {
  id: string
  serviceName: string
  guestName: string
  guestEmail: string
  groupSize: number
  summary: string
  startAt: string
  endAt: string
  status: 'pending' | 'confirmed'
  calendarEventId?: string
}

type BookingSandboxProvider = {
  connection: GoogleCalendarConnection
  readBusy: (
    connection: GoogleCalendarConnection,
    query: GoogleCalendarBusyQuery
  ) => Promise<GoogleCalendarInterval[]>
  createEvent: (
    connection: GoogleCalendarConnection,
    draft: GoogleCalendarEventDraft
  ) => Promise<GoogleCalendarEventResult>
  reset?: () => void
}

function requireRange(startAt: unknown, endAt: unknown) {
  const isTimestamp = (value: unknown): value is string =>
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value))

  if (!isTimestamp(startAt) || !isTimestamp(endAt)) {
    throw new BookingError(
      400,
      'invalid_time_range',
      'Choose a valid start and end time.'
    )
  }

  if (Date.parse(startAt) >= Date.parse(endAt)) {
    throw new BookingError(
      400,
      'invalid_time_range',
      'The end time must be after the start time.'
    )
  }

  return { startAt, endAt }
}

function overlaps(
  existing: { start: string; end: string },
  requested: { startAt: string; endAt: string }
) {
  return (
    Date.parse(existing.start) < Date.parse(requested.endAt) &&
    Date.parse(existing.end) > Date.parse(requested.startAt)
  )
}

export function createBookingSandbox(
  provider: BookingSandboxProvider,
  createId: () => string = () => `sandbox-${Date.now()}-${Math.random()}`
) {
  const reservations = new Map<string, BookingSandboxRecord>()
  const bookings = new Map<string, BookingSandboxRecord>()

  async function checkAvailability(startInput: unknown, endInput: unknown) {
    const { startAt, endAt } = requireRange(startInput, endInput)
    const busy = await provider.readBusy(provider.connection, {
      timeMin: startAt,
      timeMax: endAt,
    })

    return {
      available: !busy.some((interval) =>
        overlaps(interval, { startAt, endAt })
      ),
      busy,
    }
  }

  async function createBooking(input: unknown) {
    const value =
      typeof input === 'object' && input !== null
        ? (input as Record<string, unknown>)
        : {}
    const serviceName =
      typeof value.serviceName === 'string' ? value.serviceName.trim() : ''
    const guestName =
      typeof value.guestName === 'string' ? value.guestName.trim() : ''
    const guestEmail =
      typeof value.guestEmail === 'string' ? value.guestEmail.trim() : ''
    const groupSize = Number(value.groupSize)

    if (
      !serviceName ||
      serviceName.length > 100 ||
      /[\u0000-\u001f\u007f]/.test(serviceName)
    ) {
      throw new BookingError(
        400,
        'invalid_service',
        'Enter a service or booking title of up to 100 characters.'
      )
    }
    if (
      !guestName ||
      guestName.length > 100 ||
      /[\u0000-\u001f\u007f]/.test(guestName)
    ) {
      throw new BookingError(
        400,
        'invalid_guest',
        'Enter a guest name of up to 100 characters.'
      )
    }
    if (
      guestEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail) ||
      /[\u0000-\u001f\u007f]/.test(guestEmail)
    ) {
      throw new BookingError(400, 'invalid_email', 'Enter a valid guest email.')
    }
    if (!Number.isSafeInteger(groupSize) || groupSize < 1 || groupSize > 50) {
      throw new BookingError(
        400,
        'invalid_group_size',
        'Group size must be between 1 and 50.'
      )
    }

    const { startAt, endAt } = requireRange(value.startAt, value.endAt)
    const reservation: BookingSandboxRecord = {
      id: createId(),
      serviceName,
      guestName,
      guestEmail,
      groupSize,
      summary: `${serviceName} · ${guestName}`,
      startAt,
      endAt,
      status: 'pending',
    }

    await confirmBooking(reservation, {
      reserve: async (candidate) => {
        const conflict = [...reservations.values()].some((existing) =>
          overlaps(
            { start: existing.startAt, end: existing.endAt },
            { startAt: candidate.startAt, endAt: candidate.endAt }
          )
        )
        if (conflict) {
          throw new BookingError(
            409,
            'sandbox_slot_unavailable',
            'That time is already reserved in this sandbox.'
          )
        }
        reservations.set(candidate.id, candidate)
      },
      verify: async (candidate) => {
        const result = await checkAvailability(
          candidate.startAt,
          candidate.endAt
        )
        if (!result.available) {
          throw new BookingError(
            409,
            'sandbox_calendar_busy',
            'That time overlaps an event in the sandbox calendar.'
          )
        }
      },
      createEffect: (candidate) =>
        provider.createEvent(provider.connection, {
          summary: candidate.summary,
          description: [
            'Local FireUX Bookings sandbox event; no external write.',
            `Guest: ${candidate.guestName}`,
            `Email: ${candidate.guestEmail}`,
            `Group size: ${candidate.groupSize}`,
          ].join('\n'),
          location: 'FireUX Blank local sandbox',
          start: { dateTime: candidate.startAt },
          end: { dateTime: candidate.endAt },
        }),
      confirm: async (candidate, effect) => {
        const confirmed = {
          ...candidate,
          status: 'confirmed' as const,
          calendarEventId: effect.id,
        }
        bookings.set(candidate.id, confirmed)
        reservations.set(candidate.id, confirmed)
      },
      release: async (candidate) => {
        reservations.delete(candidate.id)
      },
    })

    const booking = bookings.get(reservation.id)
    if (!booking) {
      throw new BookingError(
        503,
        'sandbox_confirmation_missing',
        'The sandbox booking could not be confirmed.'
      )
    }
    return booking
  }

  return {
    checkAvailability,
    createBooking,
    listBookings: () =>
      [...bookings.values()].sort((a, b) => b.startAt.localeCompare(a.startAt)),
    reset: () => {
      reservations.clear()
      bookings.clear()
      provider.reset?.()
    },
  }
}

export function bookingSandboxHttpError(error: unknown) {
  if (error instanceof BookingError) {
    return createError({
      statusCode: error.statusCode,
      statusMessage: error.message,
    })
  }
  return createError({
    statusCode: 503,
    statusMessage: 'The local booking sandbox is temporarily unavailable.',
  })
}
