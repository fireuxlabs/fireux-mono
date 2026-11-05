import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const tours = [
  {
    slug: 'interlaken-panorama',
    name: 'Interlaken Panorama',
    label: 'The perfect first ride',
    duration: '4 hours',
  },
]
const source = readFileSync(
  new URL('../server/utils/tour-calendar.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'\"]+['"]\s*\n/gm, '')
  .replace(/^export /gm, '')
const adapter = compileFunction(
  `${stripTypeScriptTypes(source)}; return { interlakenTourCalendarEvent, interlakenTourCalendarConnection, readInterlakenTourCalendarBusy, createInterlakenTourCalendarEvent }`,
  ['tours', 'queryGoogleCalendarBusy', 'createGoogleCalendarEvent']
)(
  tours,
  async (_connection, query) => [{ start: query.timeMin, end: query.timeMax }],
  async (_connection, event) => ({ id: event.summary })
)

test('Interlaken adapter adds tour-specific event details and the local time zone', () => {
  assert.deepEqual(
    adapter.interlakenTourCalendarEvent({
      tourSlug: 'interlaken-panorama',
      startAt: '2026-11-05T09:00:00+01:00',
      endAt: '2026-11-05T13:00:00+01:00',
    }),
    {
      summary: 'Private bike tour · Interlaken Panorama',
      description:
        'The perfect first ride\n4 hours guided ride in Interlaken, Switzerland.',
      location: 'Interlaken, Switzerland',
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
})

test('Interlaken adapter delegates raw availability and event creation to Bookings', async () => {
  const connection = { accessToken: 'server-token', calendarId: 'primary' }
  assert.deepEqual(
    await adapter.readInterlakenTourCalendarBusy(
      connection,
      '2026-11-05T00:00:00+01:00',
      '2026-11-06T00:00:00+01:00'
    ),
    [
      {
        start: '2026-11-05T00:00:00+01:00',
        end: '2026-11-06T00:00:00+01:00',
      },
    ]
  )
  assert.deepEqual(
    await adapter.createInterlakenTourCalendarEvent(connection, {
      tourSlug: 'interlaken-panorama',
      startAt: '2026-11-05T09:00:00+01:00',
      endAt: '2026-11-05T13:00:00+01:00',
    }),
    { id: 'Private bike tour · Interlaken Panorama' }
  )
})

test('Interlaken adapter rejects unknown tour identities', () => {
  assert.throws(
    () =>
      adapter.interlakenTourCalendarEvent({
        tourSlug: 'not-a-tour',
        startAt: '2026-11-05T09:00:00+01:00',
        endAt: '2026-11-05T13:00:00+01:00',
      }),
    /Tour not found/
  )
})

test('Interlaken Calendar credentials come only from server environment input', () => {
  assert.deepEqual(
    adapter.interlakenTourCalendarConnection({
      BOOKINGS_GOOGLE_CALENDAR_ID: 'ben@example.com',
      BOOKINGS_GOOGLE_CLIENT_ID: 'oauth-client-id',
      BOOKINGS_GOOGLE_CLIENT_SECRET: 'oauth-client-secret',
      BOOKINGS_GOOGLE_REFRESH_TOKEN: 'oauth-refresh-token',
    }),
    {
      calendarId: 'ben@example.com',
      oauth: {
        clientId: 'oauth-client-id',
        clientSecret: 'oauth-client-secret',
        refreshToken: 'oauth-refresh-token',
      },
    }
  )
  assert.throws(
    () => adapter.interlakenTourCalendarConnection({}),
    /credentials are not configured/
  )
})
