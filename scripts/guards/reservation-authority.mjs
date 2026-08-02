// @fireux-script
// last_used: 2026-08-02
// usage_note: keeps private Property Reservations behind trusted commands and atomic night claims.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const files = {
  model: 'packages/extensions/fireux-reservations/src/runtime/models/reservation.model.ts',
  serverConfig: 'packages/extensions/fireux-reservations/src/config/module/server-config.ts',
  access: 'packages/extensions/fireux-reservations/src/runtime/server/reservation/access.ts',
  records: 'packages/extensions/fireux-reservations/src/runtime/server/reservation/records.ts',
  command: 'packages/extensions/fireux-reservations/src/runtime/server/reservation/command.ts',
  read: 'packages/extensions/fireux-reservations/src/runtime/server/reservation/read.ts',
  collection: 'packages/extensions/fireux-reservations/src/runtime/composables/fireux/console/property/operations/Reservations/usePropertyReservations.ts',
  create: 'packages/extensions/fireux-reservations/src/runtime/composables/fireux/console/property/operations/Reservations/useReservationCreate.ts',
  update: 'packages/extensions/fireux-reservations/src/runtime/composables/fireux/console/property/operations/Reservations/useReservationUpdate.ts',
  template: 'packages/ecosystem/fireux-buenohost/src/config/firebase/firestore.template.rules',
  rules: 'packages/ecosystem/fireux-buenohost/src/config/firebase/rules/reservation-authority.rules',
  artifact: 'scripts/firebase/buenohost/firestore.rules',
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const source = {}
  for (const [key, relative] of Object.entries(files)) {
    const absolute = path.join(repoRoot, relative)
    assert.ok(existsSync(absolute), `Reservation authority source is missing: ${relative}`)
    source[key] = readFileSync(absolute, 'utf8')
  }

  assert.match(source.model, /reservation-nights/)
  assert.match(source.serverConfig, /method:\s*'get'/)
  assert.match(source.serverConfig, /method:\s*'post'/)
  assert.match(source.serverConfig, /method:\s*'patch'/)
  assert.match(source.access, /requireFirebaseBearerUser/)
  assert.match(source.access, /Property operator access is required/)
  assert.match(source.access, /Property read access is required/)
  assert.match(source.command, /runTransaction/)
  assert.match(source.command, /transaction\.create\(lockRef/)
  assert.match(source.command, /transaction\.delete\(lock\.ref\)/)
  assert.match(source.command, /Property is already reserved on/)
  assert.match(source.records, /A Reservation cannot exceed 366 nights/)
  assert.match(source.read, /canonicalReservation/)

  for (const key of ['collection', 'create', 'update']) {
    assert.doesNotMatch(
      source[key],
      /useFirestore(?:Read|Create|Update)|firestoreFetchCollection|createDocument|updateDocument/,
      `${files[key]} must not access Reservation Firestore directly.`
    )
    assert.match(source[key], /\/api\/console\/properties\//)
  }

  assert.match(source.template, /@fireux-rules-template buenohost/)
  assert.match(source.rules, /match \/properties\/\{propertyId\}\/reservations\/\{reservationId\}/)
  assert.match(source.rules, /match \/properties\/\{propertyId\}\/reservation-nights\/\{date\}/)
  assert.match(source.rules, /allow get, list, delete: if false/)
  assert.match(source.rules, /isValidReservation\(request\.resource\.data, propertyId\)/)
  assert.match(source.rules, /isValidReservationNight\(request\.resource\.data, propertyId, date\)/)
  assert.equal(source.artifact.includes('@fireux-core-rules'), false)

  console.log('[guard] ✅ Reservation PII, commands, and availability use the trusted Property boundary')
}
