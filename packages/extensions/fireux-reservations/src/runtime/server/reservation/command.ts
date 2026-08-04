import { FieldValue } from 'firebase-admin/firestore'
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

function nightPath(propertyId: string, date: string) {
  return `properties/${propertyId}/${ReservationNightStorage.collection}/${date}`
}

export async function createReservationCommand(
  event: H3Event,
  rawPropertyId: unknown,
  rawInput: unknown
): Promise<ReservationResponse> {
  const actor = await requireReservationActor(event, rawPropertyId, true)
  const input = reservationInput(rawInput) as ReservationCreateInput
  const dates = reservationIsActive(input.status)
    ? occupiedDates(input.arrival_date, input.departure_date)
    : []
  const ref = actor.db.collection(`properties/${actor.propertyId}/reservations`).doc()
  const nightRefs = dates.map(date => actor.db.doc(nightPath(actor.propertyId, date)))
  await actor.db.runTransaction(async transaction => {
    const locks = nightRefs.length ? await transaction.getAll(...nightRefs) : []
    const conflict = locks.find(lock => lock.exists)
    if (conflict) reservationFail(409, `Property is already reserved on ${conflict.id}.`)
    transaction.create(ref, {
      ...input,
      property_id: actor.propertyId,
      sync: {
        state: input.source === 'direct' || input.source === 'manual' ? 'local' : 'pending',
        channel_updated_at: null,
      },
      created: serverAuditStamp({ by: actor.uid, appId: actor.appId }),
      updated: serverAuditStamp({ by: actor.uid }),
    })
    for (const [index, lockRef] of nightRefs.entries()) {
      transaction.create(lockRef, {
        property_id: actor.propertyId,
        reservation_id: ref.id,
        date: dates[index],
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
  await actor.db.runTransaction(async transaction => {
    const existingSnapshot = await transaction.get(ref)
    if (!existingSnapshot.exists) reservationFail(404, 'Reservation not found.')
    const existing = canonicalReservation(reservationId, existingSnapshot.data())
    const next = { ...existing, ...patch } as Reservation
    const oldDates = reservationIsActive(existing.status)
      ? occupiedDates(existing.arrival_date, existing.departure_date)
      : []
    const nextDates = reservationIsActive(next.status)
      ? occupiedDates(next.arrival_date, next.departure_date)
      : []
    const allDates = [...new Set([...oldDates, ...nextDates])]
    const lockRefs = allDates.map(date => actor.db.doc(nightPath(actor.propertyId, date)))
    const locks = lockRefs.length ? await transaction.getAll(...lockRefs) : []
    const nextSet = new Set(nextDates)
    for (const lock of locks) {
      if (nextSet.has(lock.id) && lock.exists && lock.get('reservation_id') !== reservationId) {
        reservationFail(409, `Property is already reserved on ${lock.id}.`)
      }
    }
    transaction.update(ref, { ...patch, updated: serverAuditStamp({ by: actor.uid }) })
    for (const lock of locks) {
      if (!nextSet.has(lock.id) && lock.exists && lock.get('reservation_id') === reservationId) {
        transaction.delete(lock.ref)
      }
    }
    for (const date of nextDates) {
      const lock = locks.find(snapshot => snapshot.id === date)
      if (!lock?.exists) {
        transaction.create(actor.db.doc(nightPath(actor.propertyId, date)), {
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
