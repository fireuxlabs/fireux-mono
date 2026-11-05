import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { readBusinessMutationActor, requireBusinessMutationAuthority } from 'fireux-businesses/runtime/business/server/team/authority'
import { readBookingAvailability } from '../../utils/availability'
import { businessBookingTargets } from './targets'

export async function readBusinessBookings(event: H3Event, idValue: unknown, cursorValue?: unknown) {
  const id = requireFirestoreDocumentId(idValue, 'Business id')
  const cursor = cursorValue ? requireFirestoreDocumentId(cursorValue, 'Booking cursor') : ''
  const actor = await readBusinessMutationActor(event)
  const targets = businessBookingTargets(id)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireBusinessMutationAuthority(tx, actor, id)
    const [settings, rows] = await Promise.all([
      tx.read(targets.settings, 'availability'), tx.readAll<Record<string, unknown>>(targets.bookings, 101, cursor || undefined),
    ])
    const bookings = rows.slice(0, 100).map((row) => ({ ...row.data, id: row.id }))
      .sort((a, b) => String((a as Record<string, unknown>).start_at).localeCompare(String((b as Record<string, unknown>).start_at)))
    return { businessId: id, availability: readBookingAvailability(settings.exists ? settings.data : null), bookings, nextCursor: rows.length > 100 ? rows[99]!.id : '' }
  })
}
export async function updateBusinessBookingAvailability(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some((key) => !['businessId', 'availability'].includes(key)))
    throw createError({ statusCode: 400, statusMessage: 'Invalid availability request.' })
  const body = input as Record<string, unknown>
  const id = requireFirestoreDocumentId(body.businessId, 'Business id')
  let next
  try { next = readBookingAvailability(body.availability) } catch {
    throw createError({ statusCode: 400, statusMessage: 'Check the working days, closed dates and departure time.' })
  }
  if (!body.availability) throw createError({ statusCode: 400, statusMessage: 'Availability is required.' })
  const actor = await readBusinessMutationActor(event)
  const target = businessBookingTargets(id).settings
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireBusinessMutationAuthority(tx, actor, id)
    const existing = await tx.read(target, 'availability')
    const current = readBookingAvailability(existing.exists ? existing.data : null)
    if (current.revision !== next.revision) throw createError({ statusCode: 409, statusMessage: 'Availability changed in another session. Refresh before saving.' })
    const value = { ...next, revision: current.revision + 1 }
    if (existing.exists) tx.update(target, 'availability', value)
    else tx.create(target, 'availability', value)
  })
  return { ok: true, businessId: id }
}
