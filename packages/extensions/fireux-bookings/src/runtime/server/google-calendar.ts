const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export type GoogleCalendarOAuthCredentials = {
  clientId: string
  clientSecret: string
  refreshToken: string
}

export type GoogleCalendarConnection = {
  accessToken?: string
  oauth?: GoogleCalendarOAuthCredentials
  calendarId: string
  fetcher?: typeof fetch
}

export type GoogleCalendarInterval = {
  start: string
  end: string
}

export type GoogleCalendarBusyQuery = {
  timeMin: string
  timeMax: string
  timeZone?: string
}

export type GoogleCalendarDateTime = {
  dateTime: string
  timeZone?: string
}

export type GoogleCalendarEventDraft = {
  summary: string
  description?: string
  location?: string
  start: GoogleCalendarDateTime
  end: GoogleCalendarDateTime
}

export type GoogleCalendarEventResult = {
  id: string
  htmlLink?: string
}

export class GoogleCalendarApiError extends Error {
  readonly operation: 'oauth.refresh' | 'freebusy' | 'events.insert'
  readonly statusCode: number

  constructor(
    operation: 'oauth.refresh' | 'freebusy' | 'events.insert',
    statusCode: number
  ) {
    super(
      `Google Calendar ${operation} failed (${statusCode || 'invalid response'}).`
    )
    this.name = 'GoogleCalendarApiError'
    this.operation = operation
    this.statusCode = statusCode
  }
}

function requireConnection(connection: GoogleCalendarConnection) {
  if (!connection || typeof connection !== 'object') {
    throw new TypeError('A Google Calendar connection is required.')
  }
  const hasAccessToken =
    typeof connection.accessToken === 'string' &&
    connection.accessToken.trim().length > 0
  const hasRefreshCredentials =
    typeof connection.oauth?.clientId === 'string' &&
    connection.oauth.clientId.trim().length > 0 &&
    typeof connection.oauth.clientSecret === 'string' &&
    connection.oauth.clientSecret.trim().length > 0 &&
    typeof connection.oauth.refreshToken === 'string' &&
    connection.oauth.refreshToken.trim().length > 0
  if (!hasAccessToken && !hasRefreshCredentials) {
    throw new TypeError(
      'Google Calendar access or refresh credentials are required.'
    )
  }
  if (
    typeof connection.calendarId !== 'string' ||
    !connection.calendarId.trim()
  ) {
    throw new TypeError('A Google Calendar id is required.')
  }
}

const refreshedTokens = new WeakMap<
  GoogleCalendarConnection,
  { accessToken: string; expiresAt: number }
>()

async function resolveAccessToken(connection: GoogleCalendarConnection) {
  if (connection.accessToken?.trim()) return connection.accessToken.trim()

  const credentials = connection.oauth
  if (!credentials) {
    throw new TypeError(
      'Google Calendar access or refresh credentials are required.'
    )
  }

  const cached = refreshedTokens.get(connection)
  if (cached && cached.expiresAt - Date.now() > 60_000) {
    return cached.accessToken
  }

  const fetcher = connection.fetcher ?? globalThis.fetch
  let response: Response
  try {
    response = await fetcher(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: credentials.refreshToken,
        grant_type: 'refresh_token',
      }),
    })
  } catch {
    throw new GoogleCalendarApiError('oauth.refresh', 0)
  }
  if (!response.ok) {
    throw new GoogleCalendarApiError('oauth.refresh', response.status)
  }

  let token: { access_token?: unknown; expires_in?: unknown }
  try {
    token = (await response.json()) as typeof token
  } catch {
    throw new GoogleCalendarApiError('oauth.refresh', 0)
  }
  if (typeof token.access_token !== 'string' || !token.access_token.trim()) {
    throw new GoogleCalendarApiError('oauth.refresh', 0)
  }

  const expiresIn = Number(token.expires_in)
  if (Number.isFinite(expiresIn) && expiresIn > 0) {
    refreshedTokens.set(connection, {
      accessToken: token.access_token,
      expiresAt: Date.now() + expiresIn * 1000,
    })
  }
  return token.access_token
}

function timestamp(value: unknown, label: string) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new TypeError(
      `${label} must be an RFC 3339 timestamp with an offset.`
    )
  }
  return Date.parse(value)
}

function requireRange(start: unknown, end: unknown, label: string) {
  const startMs = timestamp(start, `${label} start`)
  const endMs = timestamp(end, `${label} end`)
  if (startMs >= endMs) {
    throw new TypeError(`${label} end must be after its start.`)
  }
}

async function requestGoogleCalendar<T>(
  connection: GoogleCalendarConnection,
  operation: GoogleCalendarApiError['operation'],
  path: string,
  body: unknown
): Promise<T> {
  requireConnection(connection)
  const fetcher = connection.fetcher ?? globalThis.fetch
  const accessToken = await resolveAccessToken(connection)
  const response = await fetcher(`${GOOGLE_CALENDAR_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new GoogleCalendarApiError(operation, response.status)
  }
  try {
    return (await response.json()) as T
  } catch {
    throw new GoogleCalendarApiError(operation, 0)
  }
}

/**
 * Return Google's raw busy intervals. The calling domain decides how those
 * intervals affect its own availability and booking authority.
 */
export async function queryGoogleCalendarBusy(
  connection: GoogleCalendarConnection,
  query: GoogleCalendarBusyQuery
): Promise<GoogleCalendarInterval[]> {
  requireConnection(connection)
  requireRange(query?.timeMin, query?.timeMax, 'FreeBusy query')
  const result = await requestGoogleCalendar<{
    calendars?: Record<
      string,
      {
        errors?: unknown[]
        busy?: Array<{ start?: unknown; end?: unknown }>
      }
    >
  }>(connection, 'freebusy', '/freeBusy', {
    timeMin: query.timeMin,
    timeMax: query.timeMax,
    ...(query.timeZone ? { timeZone: query.timeZone } : {}),
    items: [{ id: connection.calendarId }],
  })

  const calendar = result.calendars?.[connection.calendarId]
  if (
    !calendar ||
    (calendar.errors?.length ?? 0) > 0 ||
    !Array.isArray(calendar.busy)
  ) {
    throw new GoogleCalendarApiError('freebusy', 0)
  }

  return calendar.busy.map((period) => {
    requireRange(period.start, period.end, 'Google Calendar busy interval')
    return { start: period.start as string, end: period.end as string }
  })
}

/** Create a calendar event without choosing the domain's booking lifecycle. */
export async function createGoogleCalendarEvent(
  connection: GoogleCalendarConnection,
  draft: GoogleCalendarEventDraft
): Promise<GoogleCalendarEventResult> {
  requireConnection(connection)
  if (!draft || typeof draft.summary !== 'string' || !draft.summary.trim()) {
    throw new TypeError('A Google Calendar event summary is required.')
  }
  requireRange(draft.start?.dateTime, draft.end?.dateTime, 'Calendar event')

  const event = await requestGoogleCalendar<{
    id?: unknown
    htmlLink?: unknown
  }>(
    connection,
    'events.insert',
    `/calendars/${encodeURIComponent(connection.calendarId)}/events`,
    {
      summary: draft.summary.trim(),
      ...(draft.description ? { description: draft.description } : {}),
      ...(draft.location ? { location: draft.location } : {}),
      start: draft.start,
      end: draft.end,
    }
  )

  if (typeof event.id !== 'string' || !event.id) {
    throw new GoogleCalendarApiError('events.insert', 0)
  }
  return {
    id: event.id,
    ...(typeof event.htmlLink === 'string' ? { htmlLink: event.htmlLink } : {}),
  }
}
