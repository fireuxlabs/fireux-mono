import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL('../runtime/server/google-calendar.ts', import.meta.url),
  'utf8'
).replace(/^export /gm, '')
const calendar = compileFunction(
  `${stripTypeScriptTypes(source)}; return { GoogleCalendarApiError, queryGoogleCalendarBusy, createGoogleCalendarEvent }`
)()

const connection = (fetcher) => ({
  accessToken: 'access-token',
  calendarId: 'operator@example.com',
  fetcher,
})

test('FreeBusy returns provider intervals without converting them into policy', async () => {
  let request
  const busy = await calendar.queryGoogleCalendarBusy(
    connection(async (url, init) => {
      request = { url, init }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          calendars: {
            'operator@example.com': {
              busy: [
                {
                  start: '2026-11-05T09:00:00+01:00',
                  end: '2026-11-05T10:00:00+01:00',
                },
              ],
            },
          },
        }),
      }
    }),
    {
      timeMin: '2026-11-05T00:00:00+01:00',
      timeMax: '2026-11-06T00:00:00+01:00',
      timeZone: 'Europe/Zurich',
    }
  )

  assert.deepEqual(busy, [
    {
      start: '2026-11-05T09:00:00+01:00',
      end: '2026-11-05T10:00:00+01:00',
    },
  ])
  assert.equal(request.url, 'https://www.googleapis.com/calendar/v3/freeBusy')
  assert.equal(request.init.headers.Authorization, 'Bearer access-token')
  assert.deepEqual(JSON.parse(request.init.body), {
    timeMin: '2026-11-05T00:00:00+01:00',
    timeMax: '2026-11-06T00:00:00+01:00',
    timeZone: 'Europe/Zurich',
    items: [{ id: 'operator@example.com' }],
  })
})

test('FreeBusy fails closed when the calendar reports an error', async () => {
  await assert.rejects(
    calendar.queryGoogleCalendarBusy(
      connection(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          calendars: {
            'operator@example.com': {
              errors: [{ reason: 'notFound' }],
              busy: [],
            },
          },
        }),
      })),
      {
        timeMin: '2026-11-05T00:00:00Z',
        timeMax: '2026-11-06T00:00:00Z',
      }
    ),
    (error) =>
      error instanceof calendar.GoogleCalendarApiError &&
      error.operation === 'freebusy'
  )
})

test('FreeBusy rejects invalid or reversed windows before sending a request', async () => {
  let called = false
  const input = connection(async () => {
    called = true
    throw new Error('unexpected request')
  })

  await assert.rejects(
    calendar.queryGoogleCalendarBusy(input, {
      timeMin: '2026-11-05T10:00:00Z',
      timeMax: '2026-11-05T09:00:00Z',
    }),
    /end must be after its start/
  )
  assert.equal(called, false)
})

test('event creation sends only the supplied event projection and returns provider identity', async () => {
  let request
  const event = await calendar.createGoogleCalendarEvent(
    connection(async (url, init) => {
      request = { url, init }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: 'event-123',
          htmlLink: 'https://calendar.google.com/event?eid=event-123',
        }),
      }
    }),
    {
      summary: 'Private bike tour · Interlaken Panorama',
      start: {
        dateTime: '2026-11-05T09:00:00+01:00',
        timeZone: 'Europe/Zurich',
      },
      end: {
        dateTime: '2026-11-05T13:00:00+01:00',
        timeZone: 'Europe/Zurich',
      },
    }
  )

  assert.deepEqual(event, {
    id: 'event-123',
    htmlLink: 'https://calendar.google.com/event?eid=event-123',
  })
  assert.equal(
    request.url,
    'https://www.googleapis.com/calendar/v3/calendars/operator%40example.com/events'
  )
  assert.deepEqual(JSON.parse(request.init.body), {
    summary: 'Private bike tour · Interlaken Panorama',
    start: {
      dateTime: '2026-11-05T09:00:00+01:00',
      timeZone: 'Europe/Zurich',
    },
    end: {
      dateTime: '2026-11-05T13:00:00+01:00',
      timeZone: 'Europe/Zurich',
    },
  })
  assert.equal('attendees' in JSON.parse(request.init.body), false)
})

test('provider HTTP errors do not expose the response body', async () => {
  await assert.rejects(
    calendar.createGoogleCalendarEvent(
      connection(async () => ({
        ok: false,
        status: 403,
        text: async () => 'private provider response',
      })),
      {
        summary: 'Tour',
        start: { dateTime: '2026-11-05T09:00:00Z' },
        end: { dateTime: '2026-11-05T10:00:00Z' },
      }
    ),
    (error) =>
      error instanceof calendar.GoogleCalendarApiError &&
      error.statusCode === 403 &&
      !error.message.includes('private provider response')
  )
})

test('refresh-token credentials are exchanged once and reused across Calendar calls', async () => {
  const requests = []
  const connectionWithRefresh = {
    calendarId: 'operator@example.com',
    oauth: {
      clientId: 'client-id',
      clientSecret: 'client-secret',
      refreshToken: 'refresh-token',
    },
    fetcher: async (url, init) => {
      requests.push({ url, init })
      if (url === 'https://oauth2.googleapis.com/token') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            access_token: 'short-lived-token',
            expires_in: 3600,
          }),
        }
      }
      if (url.endsWith('/freeBusy')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            calendars: { 'operator@example.com': { busy: [] } },
          }),
        }
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'event-456' }),
      }
    },
  }

  await calendar.queryGoogleCalendarBusy(connectionWithRefresh, {
    timeMin: '2026-11-05T09:00:00+01:00',
    timeMax: '2026-11-05T13:00:00+01:00',
  })
  await calendar.createGoogleCalendarEvent(connectionWithRefresh, {
    summary: 'Private tour',
    start: { dateTime: '2026-11-05T09:00:00+01:00' },
    end: { dateTime: '2026-11-05T13:00:00+01:00' },
  })

  assert.equal(
    requests.filter(({ url }) => url === 'https://oauth2.googleapis.com/token')
      .length,
    1
  )
  const tokenRequest = requests[0]
  assert.equal(tokenRequest.init.method, 'POST')
  assert.equal(
    tokenRequest.init.headers['Content-Type'],
    'application/x-www-form-urlencoded'
  )
  assert.deepEqual(
    Object.fromEntries(new URLSearchParams(tokenRequest.init.body)),
    {
      client_id: 'client-id',
      client_secret: 'client-secret',
      refresh_token: 'refresh-token',
      grant_type: 'refresh_token',
    }
  )
  assert.equal(
    requests[1].init.headers.Authorization,
    'Bearer short-lived-token'
  )
  assert.equal(
    requests[2].init.headers.Authorization,
    'Bearer short-lived-token'
  )
})

test('OAuth failures expose only the status code, not the response body', async () => {
  await assert.rejects(
    calendar.queryGoogleCalendarBusy(
      {
        calendarId: 'primary',
        oauth: {
          clientId: 'client-id',
          clientSecret: 'client-secret',
          refreshToken: 'refresh-token',
        },
        fetcher: async () => ({
          ok: false,
          status: 400,
          text: async () => 'private OAuth response',
        }),
      },
      {
        timeMin: '2026-11-05T09:00:00+01:00',
        timeMax: '2026-11-05T13:00:00+01:00',
      }
    ),
    (error) =>
      error instanceof calendar.GoogleCalendarApiError &&
      error.operation === 'oauth.refresh' &&
      error.statusCode === 400 &&
      !error.message.includes('private OAuth response')
  )
})
