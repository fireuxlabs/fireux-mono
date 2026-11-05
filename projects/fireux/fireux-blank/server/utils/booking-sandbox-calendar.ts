import type {
  GoogleCalendarConnection,
  GoogleCalendarEventDraft,
} from 'fireux-bookings/runtime/server/google-calendar'
import { createBookingSandbox } from './booking-sandbox'

const sandboxCalendarId = 'fireux-blank-local-sandbox'
const events = new Map<string, GoogleCalendarEventDraft>()
let eventSequence = 0

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const fetcher: typeof fetch = async (input, init) => {
  const url = new URL(String(input))
  let body: Record<string, any> = {}
  try {
    body = JSON.parse(String(init?.body ?? '{}'))
  } catch {
    return jsonResponse({ error: 'invalid body' }, 400)
  }

  if (url.pathname.endsWith('/freeBusy')) {
    const calendarId = body.items?.[0]?.id ?? sandboxCalendarId
    return jsonResponse({
      calendars: {
        [calendarId]: {
          busy: [...events.values()].map((event) => ({
            start: event.start.dateTime,
            end: event.end.dateTime,
          })),
        },
      },
    })
  }

  if (url.pathname.endsWith('/events')) {
    const event = body as GoogleCalendarEventDraft
    const id = `blank-sandbox-${++eventSequence}`
    events.set(id, event)
    return jsonResponse({ id })
  }

  return jsonResponse({ error: 'not found' }, 404)
}

const connection: GoogleCalendarConnection = {
  accessToken: 'local-only-sandbox-token',
  calendarId: sandboxCalendarId,
  fetcher,
}

export const bookingSandbox = createBookingSandbox({
  connection,
  readBusy: (calendar, query) => queryGoogleCalendarBusy(calendar, query),
  createEvent: (calendar, draft) => createGoogleCalendarEvent(calendar, draft),
  reset: () => {
    events.clear()
    eventSequence = 0
  },
})
