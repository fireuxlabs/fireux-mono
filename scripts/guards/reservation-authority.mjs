// @fireux-script
// last_used: 2026-09-07
// usage_note: keeps private Property Reservations behind trusted commands and atomic night claims.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const files = {
  model: 'packages/extensions/fireux-reservations/src/runtime/property/models/reservation.model.ts',
  serverConfig: 'packages/extensions/fireux-reservations/src/config/module/server-config.ts',
  propertyAuthority: 'packages/extensions/fireux-properties/src/runtime/property/server/team/authority.ts',
  access: 'packages/extensions/fireux-reservations/src/runtime/property/server/operations/reservations/access.ts',
  records: 'packages/extensions/fireux-reservations/src/runtime/property/server/operations/reservations/records.ts',
  command: 'packages/extensions/fireux-reservations/src/runtime/property/server/operations/reservations/command.ts',
  read: 'packages/extensions/fireux-reservations/src/runtime/property/server/operations/reservations/read.ts',
  collection: 'packages/extensions/fireux-reservations/src/runtime/property/composables/workspace/operations/Reservations/usePropertyReservations.ts',
  create: 'packages/extensions/fireux-reservations/src/runtime/property/composables/workspace/operations/Reservations/useReservationCreate.ts',
  update: 'packages/extensions/fireux-reservations/src/runtime/property/composables/workspace/operations/Reservations/useReservationUpdate.ts',
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
  assert.match(source.access, /readPropertyMutationActor\(event\)/)
  assert.match(source.access, /requirePropertyMutationAuthority\(tx, actor, propertyId\)/)
  assert.match(source.access, /runGuardedServerTransaction/)
  assert.match(source.access, /canonicalPropertyRoot/)
  assert.doesNotMatch(source.access, /appSupportCollection|operator_ids|team_ids|join_requests/)
  assert.match(source.propertyAuthority, /requireFirebaseBearerUser/)
  assert.match(source.propertyAuthority, /serverAppUsersTarget\(actor\.runtimeAppId\)/)
  assert.match(source.propertyAuthority, /!membership\.exists/)
  assert.match(source.propertyAuthority, /membership\.data\.properties\.includes\(propertyId\)/)
  assert.match(source.propertyAuthority, /isAppUserSubscription\(subscription\)/)
  assert.match(source.propertyAuthority, /managedAppId !== actor\.runtimeAppId/)
  assert.doesNotMatch(source.propertyAuthority, /team_ids|operator_ids|member\.status|member\.role/)

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
    assert.match(source[key], /\/api\/workspace\/properties\//)
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
