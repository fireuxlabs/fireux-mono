import assert from 'node:assert/strict'
import test from 'node:test'
import {
  identityHoursDebug,
  identityKitchenDebug,
  identityPlaceDebug,
  identityPresenceDebug,
  identityOperatingSourcesDebug,
} from '../runtime/kitchen/utils/identity-debug.ts'

test('Identity diagnostics exclude private operational fields and signed media URLs', () => {
  const secret = 'must-not-be-shared'
  const kitchen = {
    id: 'venue',
    identity: { slug: 'kitchen', status: 'active', visibility: true },
    operator_ids: [secret],
    token: secret,
    services: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        enabled: false,
        menu_ids: ['menu-stable-id'],
        interactions: [
          {
            type: 'pre_order',
            enabled: true,
            availability: { paused: true, message: secret },
            notifications: { whatsapp: { recipient_phone: secret } },
          },
        ],
      },
    ],
  }
  const place = {
    id: 'venue',
    name: 'Venue',
    timezone: 'Europe/Zurich',
    email: secret,
    image_url: `https://images.test/photo?token=${secret}`,
    claimed_by: secret,
    updated: { by: secret },
  }
  const output = {
    kitchen: identityKitchenDebug(kitchen),
    place: identityPlaceDebug(place),
    presence: identityPresenceDebug(place),
    ...identityOperatingSourcesDebug(kitchen, [
      {
        id: 'menu-stable-id',
        slug: 'menu-public-slug',
        name: 'Menu',
        status: 'published',
        created: { by: secret },
        doc: { url: secret },
      },
    ], kitchen.services),
  }
  assert.equal(JSON.stringify(output).includes(secret), false)
  assert.deepEqual(output.offerings[0].menu_ids, ['menu-stable-id'])
  assert.equal(output.offerings[0].enabled, false)
  assert.equal(output.offerings[0].interactions[0].paused, true)
  assert.equal(output.menus[0].slug, 'menu-public-slug')
  assert.equal(output.presence.profileImage, true)
})

test('Schedule snapshots preserve split, overnight and 24-hour times without shared references', () => {
  const hours = {
    source: 'custom',
    timezone: 'Europe/Zurich',
    windows: [
      { days: ['monday', 'wednesday'], open: '12:00', close: '14:00' },
      { days: ['monday'], open: '18:00', close: '01:00' },
      { days: ['sunday'], open: '00:00', close: '00:00' },
    ],
  }
  const first = identityHoursDebug(hours)
  const second = identityHoursDebug(hours)
  assert.deepEqual(first.windows, hours.windows)
  first.windows[0].days.push('friday')
  assert.deepEqual(second.windows, hours.windows)
  assert.equal(identityHoursDebug(null), null)
})

test('Large snapshots expose explicit truncation counts', () => {
  const windows = Array.from({ length: 103 }, () => ({
    days: ['monday'],
    open: '12:00',
    close: '13:00',
  }))
  assert.equal(identityHoursDebug({ windows }).omittedWindows, 3)
  const result = identityOperatingSourcesDebug(
    { services: [{ menu_ids: ['retired-root-must-not-be-read'] }] },
    Array(105).fill({ id: 'menu' }),
    Array.from({ length: 23 }, () => ({ menu_ids: Array(102).fill('menu') }))
  )
  assert.equal(result.omittedMenus, 5)
  assert.equal(result.omittedOfferings, 3)
  assert.equal(result.offerings[0].omittedMenuIds, 2)
})

test('retired root arrays do not restore Offering diagnostics', () => {
  const result = identityOperatingSourcesDebug({ services: [{ id: 'retired' }] }, [], [])
  assert.deepEqual(result.offerings, [])
  assert.equal(result.omittedOfferings, 0)
})
