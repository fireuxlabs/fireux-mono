import assert from 'node:assert/strict'
import { workspaceSwitchPath } from '../../../fireux-workspace/src/runtime/workspace/utils/switch-route.ts'
import { test } from 'node:test'
const switchPath = (matched, registered) =>
  workspaceSwitchPath(matched, registered, '/workspace/property')
test('Property switching leaves a Reservation record for its registered collection', () => {
  assert.equal(
    switchPath(
      ['/workspace/property/reservations/:reservationId'],
      ['/workspace/property/reservations']
    ),
    '/workspace/property/reservations'
  )
  assert.equal(
    switchPath(['/workspace/property/reservations/:reservationId'], []),
    '/workspace/property'
  )
  assert.equal(
    switchPath(
      ['/workspace/property/reservations'],
      ['/workspace/property/reservations']
    ),
    undefined
  )
  assert.equal(
    switchPath(['/workspace/kitchen/menu/menus/:slug'], []),
    undefined
  )
})
