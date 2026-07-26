import type { Ref } from 'vue'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  requirePropertyConsoleWrite,
  useActiveProperty,
  usePropertyConsoleChildPath,
  type ActivePropertyRuntime,
} from 'fireux-properties/runtime/composables/fireux/console/property/operations/useActiveProperty'
import {
  ReservationStorage,
  type Reservation,
  type ReservationCreateInput,
  type ReservationSource,
  type ReservationStatus,
} from '../../../../../../models/reservation.model'
import {
  isActiveReservation,
  requireDateOnly,
  reservationsOverlap,
} from '../../../../../../utils/reservation-date'

const normalize = (value: unknown) => String(value ?? '').trim()
const reservationSources = new Set<ReservationSource>([
  'direct',
  'airbnb',
  'booking_com',
  'vrbo',
  'manual',
  'other',
])
const reservationStatuses = new Set<ReservationStatus>([
  'inquiry',
  'hold',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
])

export function useReservationCreate(
  existingReservations: Ref<Reservation[]>,
  runtimeProperty: ActivePropertyRuntime = useActiveProperty()
) {
  const { createDocument } = useFirestoreCreate()
  const collectionPath = usePropertyConsoleChildPath(
    runtimeProperty,
    ReservationStorage.collection
  )

  async function createReservation(input: ReservationCreateInput) {
    const propertyId = requirePropertyConsoleWrite(
      runtimeProperty,
      'fireux-reservations'
    )
    if (runtimeProperty.isDemo.value) {
      throw new Error('[fireux-reservations] Demo reservations are read-only.')
    }

    const arrivalDate = requireDateOnly(input.arrival_date, 'arrival date')
    const departureDate = requireDateOnly(input.departure_date, 'departure date')
    if (departureDate <= arrivalDate) {
      throw new Error(
        '[fireux-reservations] departure date must be after arrival date.'
      )
    }

    const displayName = normalize(input.guest.display_name)
    if (!displayName) {
      throw new Error('[fireux-reservations] guest name is required.')
    }

    const source = reservationSources.has(input.source)
      ? input.source
      : 'direct'
    const status = reservationStatuses.has(input.status)
      ? input.status
      : 'inquiry'
    const candidate = {
      arrival_date: arrivalDate,
      departure_date: departureDate,
    }
    const conflict = existingReservations.value.find(
      (reservation) =>
        isActiveReservation(reservation) &&
        reservationsOverlap(reservation, candidate)
    )
    if (conflict) {
      throw new Error(
        `[fireux-reservations] dates overlap ${conflict.guest.display_name || conflict.id}.`
      )
    }
    if (!collectionPath.value) {
      throw new Error('[fireux-reservations] reservation path is required.')
    }

    const payload: Omit<Reservation, 'id'> = {
      property_id: propertyId,
      guest: {
        display_name: displayName,
        email: normalize(input.guest.email),
        phone: normalize(input.guest.phone),
      },
      source,
      external_reference: normalize(input.external_reference),
      status,
      arrival_date: arrivalDate,
      departure_date: departureDate,
      adults: Math.max(1, Math.trunc(Number(input.adults) || 1)),
      children: Math.max(0, Math.trunc(Number(input.children) || 0)),
      total: input.total,
      notes: normalize(input.notes),
      sync: {
        state: source === 'direct' || source === 'manual' ? 'local' : 'pending',
        channel_updated_at: null,
      },
      created: { at: {} as any, by: undefined, app_id: undefined },
      updated: { at: {} as any, by: undefined },
    }

    return createDocument<Omit<Reservation, 'id'>>(
      collectionPath.value,
      payload,
      { stamp: true, creator: true, app: true }
    )
  }

  return {
    createReservation,
  }
}
