import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { readGoogleRegularHours } from '../runtime/place/utils/google-hours.ts'

const period = (day, open, close, closeDay = day) => ({
  open: { day, time: open },
  close: { day: closeDay, time: close },
})

test('Google regular hours retain split shifts, weekday identity and overnight closing', () => {
  assert.deepEqual(
    readGoogleRegularHours({
      periods: [
        period(2, '1100', '1400'),
        period(2, '1800', '0030', 3),
        period(0, '1200', '1800'),
      ],
    }),
    {
      status: 'available',
      hours: {
        windows: [
          { days: ['tuesday'], open: '11:00', close: '14:00' },
          { days: ['tuesday'], open: '18:00', close: '00:30' },
          { days: ['sunday'], open: '12:00', close: '18:00' },
        ],
      },
    }
  )
})

test('Google 24/7 sentinel represents all seven days, and a single full day remains one day', () => {
  const always = readGoogleRegularHours({
    periods: [{ open: { day: 0, time: '0000' } }],
  })
  assert.equal(always.hours.windows[0].days.length, 7)
  assert.equal(always.hours.windows[0].close, '00:00')
  assert.deepEqual(
    readGoogleRegularHours({ periods: [period(1, '0000', '0000', 2)] }).hours
      .windows,
    [{ days: ['monday'], open: '00:00', close: '00:00' }]
  )
})

test('absent, malformed and unrepresentable Google hours never become empty clears', () => {
  assert.deepEqual(readGoogleRegularHours(undefined), {
    hours: null,
    status: 'missing',
  })
  assert.deepEqual(readGoogleRegularHours({ periods: [] }), {
    hours: null,
    status: 'missing',
  })
  for (const periods of [
    [period(1, '2400', '1700')],
    [period(7, '0900', '1700')],
    [period(1, '0900', '1000', 2)],
    [period(1, '0900', '1700', 3)],
    [{ open: { day: 2, time: '0000' } }],
    [period(1, '0900', '1700'), {}],
  ])
    assert.deepEqual(readGoogleRegularHours({ periods }), {
      hours: null,
      status: 'unsupported',
    })
})

function load(path, names, dependencies) {
  const source = readFileSync(
    new URL(`../runtime/${path}`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

test('verified Google read requests regular hours only when asked and preserves existing creation payload', async () => {
  const urls = []
  let returnedId = 'exact-id'
  const api = load(
    'place/server/integration/google/details.ts',
    'fetchVerifiedGooglePlaceDetails, fetchVerifiedGooglePlacePayload',
    {
      resolvePlacesApiKey: () => 'test-key',
      createError: ({ statusMessage }) => new Error(statusMessage),
      fetch: async (url) => {
        urls.push(new URL(url))
        return {
          ok: true,
          json: async () => ({
            status: 'OK',
            html_attributions: ['Provider'],
            result: {
              place_id: returnedId,
              name: 'Venue',
              geometry: { location: { lat: 47, lng: 8 } },
              opening_hours: { periods: [period(1, '0900', '1700')] },
            },
          }),
        }
      },
    }
  )
  const creation = await api.fetchVerifiedGooglePlacePayload({}, 'exact-id')
  assert.equal(Object.hasOwn(creation, 'business_hours'), false)
  assert.equal(Object.hasOwn(creation, 'attributions'), false)
  assert.equal(
    urls[0].searchParams.get('fields').includes('opening_hours'),
    false
  )
  const review = await api.fetchVerifiedGooglePlaceDetails({}, 'exact-id', true)
  assert.deepEqual(review.attributions, ['Provider'])
  assert.equal(
    urls[1].searchParams.get('fields').includes('opening_hours'),
    true
  )
  assert.equal(
    urls[1].searchParams.get('fields').includes('secondary_opening_hours'),
    false
  )
  returnedId = 'different-id'
  await assert.rejects(
    api.fetchVerifiedGooglePlaceDetails({}, 'exact-id', true),
    /different identity/
  )
})

test('review endpoint authenticates before provider access and returns only bounded comparison facts', async () => {
  const trace = []
  let denied = false
  const endpoint = load(
    'server/api/places/[placeId]/google.get.ts',
    'handler',
    {
      defineEventHandler: (callback) => callback,
      requireFirebaseBearerUser: async () => {
        trace.push('authenticate')
        if (denied) throw new Error('Denied')
      },
      getRouterParam: () => 'exact-id',
      requireFirestoreDocumentId: (value) => value,
      setResponseHeader: (_, key, value) => {
        assert.equal(key, 'Cache-Control')
        assert.equal(value, 'private, no-store')
      },
      fetchVerifiedGooglePlaceDetails: async (_, id, hours) => {
        trace.push('provider')
        assert.equal(id, 'exact-id')
        assert.equal(hours, true)
        return {
          payload: {
            name: 'Venue',
            phone: '+41',
            lat: 47,
            address: { city: 'Zurich' },
            price_level: '2',
            default_currency_code: 'CHF',
          },
          openingHours: undefined,
          attributions: [],
        }
      },
      resolveTimezone: async () => 'Europe/Zurich',
      readGoogleRegularHours,
    }
  )
  assert.deepEqual(await endpoint.handler({}), {
    placeId: 'exact-id',
    name: 'Venue',
    phone: '+41',
    timezone: 'Europe/Zurich',
    business_hours: null,
    hoursStatus: 'missing',
    attributions: [],
  })
  assert.deepEqual(trace, ['authenticate', 'provider'])
  denied = true
  await assert.rejects(endpoint.handler({}), /Denied/)
  assert.deepEqual(trace, ['authenticate', 'provider', 'authenticate'])
})
