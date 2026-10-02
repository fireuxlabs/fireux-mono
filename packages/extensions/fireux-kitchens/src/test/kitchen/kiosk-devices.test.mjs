import assert from 'node:assert/strict'
import test from 'node:test'
import {
  load,
  kioskService,
  readKitchenServices,
  kitchenServiceSupportsKiosk,
} from './kiosk-test-helpers.mjs'

function harness({
  services = [kioskService],
  menu = {},
  authorized = true,
  records = [],
} = {}) {
  const writes = [],
    cookies = [],
    calls = []
  const stamp = (millis) => ({
    toMillis: () => millis,
    toDate: () => new Date(millis),
  })
  const api = load(
    '../../runtime/kitchen/server/kiosks/devices.ts',
    'activateKitchenKioskDevice,readKitchenKioskDevices',
    {
      randomUUID: () => 'counter',
      createError: (input) =>
        Object.assign(new Error(input.statusMessage), input),
      requireFirestoreDocumentId: (value) => {
        if (!value || typeof value !== 'string' || value.includes('/'))
          throw new Error('Invalid id')
        return value
      },
      Timestamp: { fromMillis: stamp },
      serverAuditStamp: (input) => input,
      serverTimestamp: () => stamp(Date.now()),
      serverKitchenMenusTarget: (id) => `kitchens/${id}/menus`,
      serverKitchenKiosksTarget: (id) => `kitchens/${id}/kiosks`,
      readKitchenMutationActor: async () => ({
        runtimeAppId: 'misebox-app',
        uid: 'operator',
      }),
      requireKitchenMutationAuthority: async () => {
        calls.push('authority')
        if (!authorized) throw new Error('Forbidden')
        return { rootData: { slug: 'venue', services } }
      },
      runGuardedServerTransaction: async (_, callback) =>
        callback({
          query: async () => [],
          readAll: async () => records,
          read: async () => ({
            exists: true,
            data: { status: 'published', slug: 'food', ...menu },
          }),
          create: (...args) => {
            calls.push('create')
            writes.push(args)
          },
        }),
      KITCHEN_KIOSK_SESSION_MAX_AGE_SECONDS: 60,
      readKitchenKioskSessionFromEvent: () => null,
      kitchenKioskSessionMatchesRecord: () => false,
      setKitchenKioskSessionCookie: (...args) => cookies.push(args),
      createKitchenKioskSessionToken: () => ({
        token: 'secret',
        hash: 'digest',
      }),
      readKitchenServices,
      kitchenServiceSupportsKiosk,
    }
  )
  return { ...api, writes, cookies, calls, stamp }
}
const input = { kitchenId: 'venue', kitchenServiceId: 'lunch', menuId: 'food' }

test('activation stores the explicitly chosen service and binds its kiosk URL after authority', async () => {
  const h = harness({
    services: [{ ...kioskService, id: 'first', name: 'Other' }, kioskService],
  })
  const { device } = await h.activateKitchenKioskDevice({}, input)
  assert.equal(h.writes.length, 1)
  assert.equal(h.writes[0][2].kitchen_service_id, 'lunch')
  assert.equal(h.writes[0][2].session_hash, 'digest')
  assert.equal(
    device.livePath,
    '/kitchens/venue/menus/food.kiosk?service=lunch'
  )
  assert.equal(device.serviceName, 'Lunch')
  assert.equal(device.current, true)
  assert.equal('session_hash' in device, false)
  assert.deepEqual(h.calls, ['authority', 'create'])
  assert.equal(h.cookies.length, 1)
})

test('missing, unknown or ineligible service never falls back and cannot create credentials', async () => {
  const cases = [
    { selected: '' },
    { selected: 'unknown' },
    { patch: { enabled: false } },
    { patch: { menu_ids: ['drinks'] } },
    { patch: { hours: undefined } },
    { patch: { hours: { ...kioskService.hours, timezone: '' } } },
    { patch: { interactions: [{ type: 'eat_in', enabled: false }] } },
    {
      patch: {
        interactions: [
          { type: 'takeaway', enabled: true, availability: { paused: true } },
        ],
      },
    },
    { patch: { interactions: [{ type: 'browse', enabled: true }] } },
  ]
  for (const { selected = 'lunch', patch = {} } of cases) {
    const h = harness({ services: [{ ...kioskService, ...patch }] })
    await assert.rejects(
      h.activateKitchenKioskDevice({}, { ...input, kitchenServiceId: selected })
    )
    assert.deepEqual(h.writes, [])
    assert.deepEqual(h.cookies, [])
  }
})

test('authorization, draft Menus and document-only Menus block activation', async () => {
  for (const options of [
    { authorized: false },
    { menu: { status: 'draft' } },
    { menu: { doc: { url: 'https://example.com/menu.pdf' } } },
    { menu: { slug: '' } },
  ]) {
    const h = harness(options)
    await assert.rejects(h.activateKitchenKioskDevice({}, input))
    assert.deepEqual(h.writes, [])
    assert.deepEqual(h.cookies, [])
  }
})

test('legacy active devices require reactivation and expose no usable service URL', async () => {
  const h = harness({
    records: [
      {
        id: 'old',
        data: {
          status: 'active',
          menu_id: 'food',
          session_hash: 'private',
          expires_at: { toMillis: () => Date.now() + 100000 },
        },
      },
    ],
  })
  const { devices } = await h.readKitchenKioskDevices(
    {},
    { kitchenId: 'venue' }
  )
  assert.equal(devices[0].status, 'reactivation-required')
  assert.equal(devices[0].livePath, '')
  assert.equal(devices[0].current, false)
  assert.equal('session_hash' in devices[0], false)
})

test('an enabled unpaused Takeaway interaction is eligible independently of Eat in', async () => {
  const h = harness({
    services: [
      {
        ...kioskService,
        interactions: [
          { type: 'eat_in', enabled: false },
          { type: 'takeaway', enabled: true },
        ],
      },
    ],
  })
  assert.equal(
    (await h.activateKitchenKioskDevice({}, input)).device.kitchenServiceId,
    'lunch'
  )
})
