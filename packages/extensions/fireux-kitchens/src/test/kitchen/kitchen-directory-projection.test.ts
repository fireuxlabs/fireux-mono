import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeKitchen } from '../../runtime/kitchen/utils/normalize-kitchen.ts'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'

test('published Kitchen projection includes identity and mapped location, not operational or Team data', () => {
  const place = normalizePlace('location', {
    name: 'Public venue',
    place_type: 'physical',
    formatted_address: 'Business address',
    private_notes: 'private',
    team: { people: ['private'] },
  })
  const kitchen = normalizeKitchen(
    'location',
    {
      slug: 'public-venue',
      identity_source: 'place',
      status: 'active',
      visibility: true,
      management: { level: 'app' },
      team: { people: ['private'] },
      finance: { balance: 42 },
      menus: { primary_menu_id: 'food' },
    },
    place
  )
  assert.ok(kitchen)
  assert.equal(kitchen.visibility, true)
  assert.equal(kitchen.place.name, 'Public venue')
  assert.deepEqual(Object.keys(kitchen).sort(), [
    'id',
    'identity_source',
    'place',
    'slug',
    'status',
    'visibility',
  ])
  assert.equal('private_notes' in kitchen.place, false)
  assert.equal('team' in kitchen.place, false)
})
