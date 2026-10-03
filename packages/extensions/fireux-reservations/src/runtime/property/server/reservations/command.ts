import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requirePropertyMutationAuthority } from 'fireux-properties/runtime/property/server/team/authority'
import type { H3Event } from 'h3'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import type { Reservation, ReservationCreateInput, ReservationResponse, ReservationUpdateInput } from '../../models/reservation.model.ts'
import { ReservationNightStorage } from '../../models/reservation.model.ts'
import { requireReservationActor } from './access.ts'
import {
  canonicalReservation,
  occupiedDates,
  reservationFail,
  reservationInput,
  reservationIsActive,
} from './records.ts'

function reservationTargets(propertyId: string) {
  return {
    reservations: defineFirestoreMutationTarget({ key: 'properties.reservations', lane: 'server', verbs: ['create', 'update'], database: { kind: 'runtime' }, collectionPath: `properties/${propertyId}/reservations` }),
    nights: defineFirestoreMutationTarget({ key: 'properties.reservation-nights', lane: 'server', verbs: ['create', 'delete'], database: { kind: 'runtime' }, collectionPath: `properties/${propertyId}/${ReservationNightStorage.collection}` }),
  }
}

export async function createReservationCommand(
  event: H3Event,
  rawPropertyId: unknown,
  rawInput: unknown
): Promise<ReservationResponse> {
  const actor = await requireReservationActor(event, rawPropertyId, true)
  const input = reservationInput(rawInput) as ReservationCreateInput
  const stayDates = occupiedDates(input.arrival_date, input.departure_date)
  const dates = reservationIsActive(input.status)
    ? stayDates
    : []
  const ref = actor.db.collection(`properties/${actor.propertyId}/reservations`).doc()
  const targets = reservationTargets(actor.propertyId)
  await runGuardedServerTransaction({ kind: 'runtime' }, async transaction => {
    await requirePropertyMutationAuthority(transaction, actor.mutationActor, actor.propertyId)
    const locks = dates.length ? await transaction.readMany(targets.nights, dates) : []
    const conflict = locks.find(lock => lock.exists)
    if (conflict) reservationFail(409, `Property is already reserved on ${conflict.id}.`)
    transaction.create(targets.reservations, ref.id, {
      ...input,
      property_id: actor.propertyId,
      sync: {
        state: input.source === 'direct' || input.source === 'manual' ? 'local' : 'pending',
        channel_updated_at: null,
      },
      created: serverAuditStamp({ by: actor.uid, appId: actor.appId }),
      updated: serverAuditStamp({ by: actor.uid }),
    })
    for (const date of dates) {
      transaction.create(targets.nights, date, {
        property_id: actor.propertyId,
        reservation_id: ref.id,
        date,
        created: serverAuditStamp({ by: actor.uid, appId: actor.appId }),
      })
    }
  })
  return { reservation: canonicalReservation(ref.id, (await ref.get()).data()) }
}

export async function updateReservationCommand(
  event: H3Event,
  rawPropertyId: unknown,
  rawReservationId: unknown,
  rawPatch: unknown
): Promise<ReservationResponse> {
  const actor = await requireReservationActor(event, rawPropertyId, true)
  const reservationId = String(rawReservationId ?? '').trim()
  if (!reservationId || reservationId.includes('/')) reservationFail(400, 'Reservation id is invalid.')
  const patch = reservationInput(rawPatch, true) as ReservationUpdateInput
  const ref = actor.db.doc(`properties/${actor.propertyId}/reservations/${reservationId}`)
  const targets = reservationTargets(actor.propertyId)
  await runGuardedServerTransaction({ kind: 'runtime' }, async transaction => {
    await requirePropertyMutationAuthority(transaction, actor.mutationActor, actor.propertyId)
    const existingSnapshot = await transaction.read(targets.reservations, reservationId)
    if (!existingSnapshot.exists) reservationFail(404, 'Reservation not found.')
    const existing = canonicalReservation(reservationId, existingSnapshot.data)
    const next = { ...existing, ...patch } as Reservation
    const stayDates = occupiedDates(next.arrival_date, next.departure_date)
    const oldDates = reservationIsActive(existing.status)
      ? occupiedDates(existing.arrival_date, existing.departure_date)
      : []
    const nextDates = reservationIsActive(next.status)
      ? stayDates
      : []
    const allDates = [...new Set([...oldDates, ...nextDates])]
    const locks = allDates.length ? await transaction.readMany(targets.nights, allDates) : []
    const nextSet = new Set(nextDates)
    for (const lock of locks) {
      if (nextSet.has(lock.id) && lock.exists && lock.data?.reservation_id !== reservationId) {
        reservationFail(409, `Property is already reserved on ${lock.id}.`)
      }
    }
    transaction.update(targets.reservations, reservationId, { ...patch, updated: serverAuditStamp({ by: actor.uid }) })
    for (const lock of locks) {
      if (!nextSet.has(lock.id) && lock.exists && lock.data?.reservation_id === reservationId) {
        transaction.delete(targets.nights, lock.id)
      }
    }
    for (const date of nextDates) {
      const lock = locks.find(snapshot => snapshot.id === date)
      if (!lock?.exists) {
        transaction.create(targets.nights, date, {
          property_id: actor.propertyId,
          reservation_id: reservationId,
          date,
          created: serverAuditStamp({ by: actor.uid, appId: actor.appId }),
        })
      }
    }
  })
  return { reservation: canonicalReservation(ref.id, (await ref.get()).data()) }
}
