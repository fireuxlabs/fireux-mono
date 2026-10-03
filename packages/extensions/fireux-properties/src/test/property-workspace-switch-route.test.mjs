import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
const source = readFileSync(new URL('../runtime/property/utils/workspace-switch-route.ts', import.meta.url), 'utf8').replace(/^export /gm, '')
const switchPath = compileFunction(`${stripTypeScriptTypes(source)};return propertyWorkspaceSwitchPath`)()
test('Property switching leaves a Reservation record for its registered collection', () => {
 assert.equal(switchPath(['/workspace/property/reservations/:reservationId'], ['/workspace/property/reservations']), '/workspace/property/reservations')
 assert.equal(switchPath(['/workspace/property/reservations/:reservationId'], []), '/workspace/property')
 assert.equal(switchPath(['/workspace/property/reservations'], ['/workspace/property/reservations']), undefined)
 assert.equal(switchPath(['/workspace/kitchen/menus/:slug'], []), undefined)
})
