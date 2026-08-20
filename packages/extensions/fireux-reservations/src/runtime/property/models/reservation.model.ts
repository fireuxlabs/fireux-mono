import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'

/**
 * Family: Property-scoped hospitality operation.
 * Storage: canonical child of Property.
 * Owner workspace: Property.
 *
 * A Reservation is shared by the BuenoHost global app and branded tenant apps.
 * Channel records retain provenance; Google Calendar is an optional projection,
 * never reservation authority.
 */
export const ReservationStorage = {
  shape: 'scoped',
  path: 'properties/{propertyId}/reservations/{reservationId}',
  collection: 'reservations',
  parent: 'property',
  idParam: 'reservationId',
} as const

export const ReservationNightStorage = {
  shape: 'scoped-support',
  path: 'properties/{propertyId}/reservation-nights/{date}',
  collection: 'reservation-nights',
  parent: 'property',
  idParam: 'date',
} as const

export type ReservationSource =
  | 'direct'
  | 'airbnb'
  | 'booking_com'
  | 'vrbo'
  | 'manual'
  | 'other'

export type ReservationStatus =
  | 'inquiry'
  | 'hold'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export type ReservationSyncState =
  | 'local'
  | 'synced'
  | 'pending'
  | 'stale'
  | 'error'

export type ReservationGuest = {
  display_name: string
  email: string
  phone: string
}

export type Reservation = {
  id: string
  property_id: string
  guest: ReservationGuest
  source: ReservationSource
  external_reference: string
  status: ReservationStatus
  arrival_date: string
  departure_date: string
  adults: number
  children: number
  total: FinancialMoney | null
  notes: string
  sync: {
    state: ReservationSyncState
    channel_updated_at: FirebaseTimestamp | null
  }
  created: FireuxStamped['created']
  updated: FireuxStamped['updated']
}

export type ReservationCreateInput = Omit<
  Reservation,
  'id' | 'property_id' | 'created' | 'updated' | 'sync'
>

export type ReservationUpdateInput = Partial<
  Pick<
    Reservation,
    | 'guest'
    | 'status'
    | 'arrival_date'
    | 'departure_date'
    | 'adults'
    | 'children'
    | 'total'
    | 'notes'
  >
>

export type ReservationListResponse = {
  items: Reservation[]
  limit: number
  truncated: boolean
}

export type ReservationResponse = {
  reservation: Reservation
}
