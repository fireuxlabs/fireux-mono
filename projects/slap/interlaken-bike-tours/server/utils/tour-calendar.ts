import type {
  GoogleCalendarConnection,
  GoogleCalendarEventDraft,
  GoogleCalendarInterval,
  GoogleCalendarEventResult,
} from 'fireux-bookings/runtime/server/google-calendar'
import { tours } from '../../app/content/tours'

const tourTimeZone = 'Europe/Zurich'

export type TourCalendarEventInput = {
  tourSlug: string
  startAt: string
  endAt: string
  bookingReference?: string
  guestName?: string
  guestEmail?: string
  groupSize?: number
}

export type InterlakenCalendarEnvironment = Record<string, string | undefined>

export function interlakenTourCalendarConnection(
  environment: InterlakenCalendarEnvironment = process.env
): GoogleCalendarConnection {
  const calendarId = environment.BOOKINGS_GOOGLE_CALENDAR_ID?.trim()
  const clientId = environment.BOOKINGS_GOOGLE_CLIENT_ID?.trim()
  const clientSecret = environment.BOOKINGS_GOOGLE_CLIENT_SECRET?.trim()
  const refreshToken = environment.BOOKINGS_GOOGLE_REFRESH_TOKEN?.trim()

  if (!calendarId || !clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Calendar booking credentials are not configured.')
  }

  return {
    calendarId,
    oauth: { clientId, clientSecret, refreshToken },
  }
}

export function interlakenTourCalendarEvent(
  input: TourCalendarEventInput
): GoogleCalendarEventDraft {
  const tour = tours.find((item) => item.slug === input.tourSlug)
  if (!tour) throw new Error('Tour not found.')

  return {
    summary: `Private bike tour · ${tour.name}`,
    description: [
      `${tour.label}\n${tour.duration} guided ride in Interlaken, Switzerland.`,
      input.bookingReference
        ? `Booking reference: ${input.bookingReference}`
        : '',
      input.guestName ? `Guest: ${input.guestName}` : '',
      input.guestEmail ? `Email: ${input.guestEmail}` : '',
      input.groupSize ? `Group size: ${input.groupSize}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    location: 'Interlaken, Switzerland',
    start: { dateTime: input.startAt, timeZone: tourTimeZone },
    end: { dateTime: input.endAt, timeZone: tourTimeZone },
  }
}

export async function readInterlakenTourCalendarBusy(
  connection: GoogleCalendarConnection,
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarInterval[]> {
  return queryGoogleCalendarBusy(connection, {
    timeMin,
    timeMax,
    timeZone: tourTimeZone,
  })
}

export async function createInterlakenTourCalendarEvent(
  connection: GoogleCalendarConnection,
  input: TourCalendarEventInput
): Promise<GoogleCalendarEventResult> {
  return createGoogleCalendarEvent(
    connection,
    interlakenTourCalendarEvent(input)
  )
}
