import { isBookingDayOpen } from 'fireux-bookings/runtime/utils/availability'
import type { BookingAvailability } from 'fireux-bookings/runtime/models/business-bookings'
import { BookingError, confirmBooking } from 'fireux-bookings/runtime/server/booking'
import { tours } from '../../app/content/tours'

const tourTimeZone = 'Europe/Zurich'
const maximumGroupSize = 50

export type InterlakenCalendarInterval = { start: string; end: string }

export type InterlakenTourBookingInput = {
  tourSlug: string
  date: string
  guestName: string
  guestEmail: string
  groupSize: number
  availabilityRevision: number
}

export type InterlakenTourBookingRecord = {
  id: string
  tour_slug: string
  tour_name: string
  date: string
  start_at: string
  end_at: string
  group_size: number
  unit_price_chf: number
  total_price_chf: number
  status: 'pending' | 'confirmed'
  created_at: string
  guest_name: string
  guest_email: string
  availability_revision: number
}

export const InterlakenTourBookingError = BookingError

function fail(statusCode: number, code: string, message: string): never {
  throw new InterlakenTourBookingError(statusCode, code, message)
}

function requireDate(value: unknown) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(`${value}T12:00:00Z`)) ||
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value
  ) {
    fail(400, 'invalid_date', 'Choose a valid tour date.')
  }
  return value
}

function localParts(epoch: number) {
  const values = new Intl.DateTimeFormat('en-GB', {
    timeZone: tourTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(new Date(epoch))
    .reduce<Record<string, number>>((result, part) => {
      if (part.type !== 'literal') result[part.type] = Number(part.value)
      return result
    }, {})

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  }
}

function offsetSuffix(epoch: number) {
  const parts = localParts(epoch)
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )
  const minutes = Math.round((localAsUtc - epoch) / 60_000)
  const sign = minutes >= 0 ? '+' : '-'
  const absolute = Math.abs(minutes)
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`
}

function localDateTime(epoch: number) {
  const parts = localParts(epoch)
  const date = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
  const time = `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')}`
  return `${date}T${time}${offsetSuffix(epoch)}`
}

function makeSlot(date: string, durationHours: number, departureTime: string) {
  const [departureHour, departureMinute] = departureTime.split(':').map(Number)
  const [year, month, day] = date.split('-').map(Number)
  const wallClockAsUtc = Date.UTC(year, month - 1, day, departureHour, departureMinute)
  const atWallClock = localParts(wallClockAsUtc)
  const offsetAtWallClock =
    Date.UTC(
      atWallClock.year,
      atWallClock.month - 1,
      atWallClock.day,
      atWallClock.hour,
      atWallClock.minute,
      atWallClock.second
    ) - wallClockAsUtc
  const startEpoch = wallClockAsUtc - offsetAtWallClock
  const resolved = localParts(startEpoch)
  if (resolved.year !== year || resolved.month !== month || resolved.day !== day || resolved.hour !== departureHour || resolved.minute !== departureMinute)
    fail(409, 'invalid_departure_time', 'This departure time does not exist on that date because of the clock change.')
  const endEpoch = startEpoch + durationHours * 60 * 60 * 1000

  return {
    departureTime,
    startAt: localDateTime(startEpoch),
    endAt: localDateTime(endEpoch),
    startEpoch,
    endEpoch,
  }
}

function requireTour(tourSlug: unknown) {
  if (typeof tourSlug !== 'string') {
    fail(400, 'invalid_tour', 'Choose one of the listed private tours.')
  }
  const tour = tours.find((item) => item.slug === tourSlug)
  if (!tour)
    fail(400, 'invalid_tour', 'Choose one of the listed private tours.')
  if (!Number.isSafeInteger(tour.durationHours) || tour.durationHours < 1) {
    fail(503, 'tour_unavailable', 'This tour cannot be booked right now.')
  }
  return tour
}

function requireGuest(input: Record<string, unknown>) {
  const guestName =
    typeof input.guestName === 'string' ? input.guestName.trim() : ''
  const guestEmail =
    typeof input.guestEmail === 'string' ? input.guestEmail.trim() : ''
  const groupSize = Number(input.groupSize)

  if (
    !guestName ||
    guestName.length > 100 ||
    /[\u0000-\u001f\u007f]/.test(guestName)
  ) {
    fail(400, 'invalid_guest', 'Enter a name of up to 100 characters.')
  }
  if (
    guestEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail) ||
    /[\u0000-\u001f\u007f]/.test(guestEmail)
  ) {
    fail(400, 'invalid_email', 'Enter a valid email address.')
  }
  if (
    !Number.isSafeInteger(groupSize) ||
    groupSize < 1 ||
    groupSize > maximumGroupSize
  ) {
    fail(
      400,
      'invalid_group_size',
      `Group size must be between 1 and ${maximumGroupSize}.`
    )
  }

  return { guestName, guestEmail, groupSize }
}

function overlaps(
  busy: InterlakenCalendarInterval[],
  slot: { startEpoch: number; endEpoch: number }
) {
  return busy.some((interval) => {
    const start = Date.parse(interval.start)
    const end = Date.parse(interval.end)
    return (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start < slot.endEpoch &&
      end > slot.startEpoch
    )
  })
}

function availabilityResult(
  tour: (typeof tours)[number],
  date: string,
  slot: ReturnType<typeof makeSlot>,
  available: boolean,
  reason?: string,
  availabilityRevision = 0
) {
  return {
    tourSlug: tour.slug,
    tourName: tour.name,
    date,
    departureTime: slot.departureTime,
    timeZone: tourTimeZone,
    startAt: slot.startAt,
    endAt: slot.endAt,
    availabilityRevision,
    durationHours: tour.durationHours,
    unitPriceChf: tour.price,
    available,
    ...(reason ? { reason } : {}),
  }
}

export function createInterlakenTourBookingWorkflow(dependencies: {
  calendar: {
    readBusy: (
      startAt: string,
      endAt: string
    ) => Promise<InterlakenCalendarInterval[]>
    createEvent: (input: {
      tourSlug: string
      startAt: string
      endAt: string
      bookingReference: string
      guestName: string
      guestEmail: string
      groupSize: number
    }) => Promise<{ id: string }>
  }
  store: {
    readAvailability: () => Promise<BookingAvailability>
    isDateReserved: (date: string) => Promise<boolean>
    reserve: (
      date: string,
      booking: InterlakenTourBookingRecord
    ) => Promise<void>
    confirm: (
      date: string,
      bookingId: string,
      calendarEventId: string
    ) => Promise<void>
    release: (date: string, bookingId: string) => Promise<void>
  }
  now?: () => Date
  createId?: () => string
}) {
  const now = dependencies.now ?? (() => new Date())
  const createId = dependencies.createId ?? (() => crypto.randomUUID())

  async function checkAvailability(rawInput: {
    tourSlug: unknown
    date: unknown
  }) {
    const tour = requireTour(rawInput.tourSlug)
    const date = requireDate(rawInput.date)
    const settings = await dependencies.store.readAvailability()
    const slot = makeSlot(date, tour.durationHours, settings.departureTime)
    if (!isBookingDayOpen(settings, date)) return availabilityResult(tour, date, slot, false, 'closed', settings.revision)

    if (slot.startEpoch <= now().getTime()) {
      return availabilityResult(tour, date, slot, false, 'past')
    }
    if (await dependencies.store.isDateReserved(date)) {
      return availabilityResult(tour, date, slot, false, 'booked')
    }

    const busy = await dependencies.calendar.readBusy(slot.startAt, slot.endAt)
    return availabilityResult(
      tour,
      date,
      slot,
      !overlaps(busy, slot),
      overlaps(busy, slot) ? 'calendar-busy' : undefined,
      settings.revision
    )
  }

  async function book(rawInput: Record<string, unknown>) {
    const tour = requireTour(rawInput.tourSlug)
    const date = requireDate(rawInput.date)
    const guest = requireGuest(rawInput)
    const availability = await checkAvailability({ tourSlug: tour.slug, date })
    if (!availability.available) {
      fail(
        409,
        'slot_unavailable',
        'That private tour time is no longer available. Choose another date.'
      )
    }

    if (!Number.isSafeInteger(rawInput.availabilityRevision) || rawInput.availabilityRevision !== availability.availabilityRevision)
      fail(409, 'availability_changed', 'Availability changed. Check the date and departure time again before booking.')
    const slot = makeSlot(date, tour.durationHours, availability.departureTime)
    const bookingId = createId()
    const booking: InterlakenTourBookingRecord = {
      id: bookingId,
      tour_slug: tour.slug,
      tour_name: tour.name,
      date,
      start_at: slot.startAt,
      end_at: slot.endAt,
      group_size: guest.groupSize,
      unit_price_chf: tour.price,
      total_price_chf: tour.price * guest.groupSize,
      status: 'pending',
      created_at: now().toISOString(),
      guest_name: guest.guestName, guest_email: guest.guestEmail,
      availability_revision: availability.availabilityRevision,
    }

    try {
      await confirmBooking(booking, {
        reserve: (record) => dependencies.store.reserve(date, record),
        verify: async () => {
          const settings = await dependencies.store.readAvailability()
          if (settings.revision !== availability.availabilityRevision || !isBookingDayOpen(settings, date))
            fail(409, 'slot_unavailable', 'Availability changed. Please choose your date again.')
          const latestBusy = await dependencies.calendar.readBusy(
            slot.startAt,
            slot.endAt
          )
          if (overlaps(latestBusy, slot)) {
            fail(
              409,
              'slot_unavailable',
              'That private tour time is no longer available. Choose another date.'
            )
          }
        },
        createEffect: () => dependencies.calendar.createEvent({
          tourSlug: tour.slug,
          startAt: slot.startAt,
          endAt: slot.endAt,
          bookingReference: bookingId,
          guestName: guest.guestName,
          guestEmail: guest.guestEmail,
          groupSize: guest.groupSize,
        }),
        confirm: (_record, event) =>
          dependencies.store.confirm(date, bookingId, event.id),
        release: () => dependencies.store.release(date, bookingId),
      })
    } catch (error) {
      if (
        error instanceof BookingError &&
        error.code === 'booking_reconciliation_required'
      ) {
        throw new BookingError(
          error.statusCode,
          error.code,
          `${error.message} Booking reference: ${bookingId}.`
        )
      }
      throw error
    }

    return {
      booking: {
        id: bookingId,
        tourSlug: tour.slug,
        tourName: tour.name,
        date,
        departureTime: slot.departureTime,
        timeZone: tourTimeZone,
        startAt: slot.startAt,
        endAt: slot.endAt,
        groupSize: guest.groupSize,
        unitPriceChf: tour.price,
        totalPriceChf: tour.price * guest.groupSize,
        currency: 'CHF',
        status: 'confirmed' as const,
      },
    }
  }

  return { checkAvailability, book }
}
