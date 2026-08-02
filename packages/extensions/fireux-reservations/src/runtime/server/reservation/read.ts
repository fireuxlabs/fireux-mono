import type { H3Event } from 'h3'
import type { ReservationListResponse, ReservationResponse } from '../../models/reservation.model.ts'
import { requireReservationActor } from './access.ts'
import { canonicalReservation, reservationFail } from './records.ts'

export const RESERVATION_LIST_LIMIT = 500

export async function listReservations(
  event: H3Event,
  rawPropertyId: unknown
): Promise<ReservationListResponse> {
  const actor = await requireReservationActor(event, rawPropertyId)
  const snapshot = await actor.db
    .collection(`properties/${actor.propertyId}/reservations`)
    .limit(RESERVATION_LIST_LIMIT + 1)
    .get()
  const items = snapshot.docs
    .slice(0, RESERVATION_LIST_LIMIT)
    .map(document => canonicalReservation(document.id, document.data()))
    .sort((left, right) => left.arrival_date.localeCompare(right.arrival_date))
  return { items, limit: RESERVATION_LIST_LIMIT, truncated: snapshot.size > RESERVATION_LIST_LIMIT }
}

export async function getReservation(
  event: H3Event,
  rawPropertyId: unknown,
  rawReservationId: unknown
): Promise<ReservationResponse> {
  const actor = await requireReservationActor(event, rawPropertyId)
  const reservationId = String(rawReservationId ?? '').trim()
  if (!reservationId || reservationId.includes('/')) reservationFail(400, 'Reservation id is invalid.')
  const snapshot = await actor.db.doc(
    `properties/${actor.propertyId}/reservations/${reservationId}`
  ).get()
  if (!snapshot.exists) reservationFail(404, 'Reservation not found.')
  return { reservation: canonicalReservation(snapshot.id, snapshot.data()) }
}
