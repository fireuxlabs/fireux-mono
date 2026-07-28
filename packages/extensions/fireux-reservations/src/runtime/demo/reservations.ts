import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Reservation } from '../models/reservation.model'

const demoAppId = 'buenohost'
const demoPropertyId = 'alpine-stay'
const stamp: FirebaseTimestamp = { seconds: 1_784_534_400, nanoseconds: 0 }
const created = { at: stamp, by: 'demo', app_id: demoAppId }
const updated = { at: stamp, by: 'demo' }

export const reservationDemoRecords: Reservation[] = [
  {
    id: 'demo-airbnb-ada',
    property_id: demoPropertyId,
    guest: {
      display_name: 'Ada M.',
      email: 'ada@example.test',
      phone: '+41 00 000 00 00',
    },
    source: 'airbnb',
    external_reference: 'HM-DEMO-481',
    status: 'checked_in',
    arrival_date: '2026-07-27',
    departure_date: '2026-07-31',
    adults: 2,
    children: 0,
    total: { amount_minor: 128000, currency_code: 'CHF' },
    notes: 'Late train arrival. Send the self check-in guide.',
    sync: { state: 'synced', channel_updated_at: stamp },
    created,
    updated,
  },
  {
    id: 'demo-booking-luca',
    property_id: demoPropertyId,
    guest: {
      display_name: 'Luca R.',
      email: 'luca@example.test',
      phone: '+39 000 000 0000',
    },
    source: 'booking_com',
    external_reference: 'BDC-DEMO-206',
    status: 'confirmed',
    arrival_date: '2026-08-03',
    departure_date: '2026-08-08',
    adults: 2,
    children: 1,
    total: { amount_minor: 171500, currency_code: 'CHF' },
    notes: '',
    sync: { state: 'pending', channel_updated_at: stamp },
    created,
    updated,
  },
  {
    id: 'demo-direct-samira',
    property_id: demoPropertyId,
    guest: {
      display_name: 'Samira K.',
      email: 'samira@example.test',
      phone: '+44 0000 000000',
    },
    source: 'direct',
    external_reference: '',
    status: 'hold',
    arrival_date: '2026-08-12',
    departure_date: '2026-08-16',
    adults: 3,
    children: 0,
    total: { amount_minor: 139000, currency_code: 'CHF' },
    notes: 'Direct enquiry. Hold expires after confirmation call.',
    sync: { state: 'local', channel_updated_at: null },
    created,
    updated,
  },
]

const activeReservations = reservationDemoRecords
  .filter((reservation) => reservation.status !== 'cancelled')
  .slice()
  .sort((left, right) => left.arrival_date.localeCompare(right.arrival_date))
const reservationIds = new Set<string>()

for (const [index, reservation] of activeReservations.entries()) {
  if (
    !reservation.id ||
    reservationIds.has(reservation.id) ||
    reservation.property_id !== demoPropertyId ||
    reservation.created.app_id !== demoAppId ||
    reservation.arrival_date >= reservation.departure_date ||
    !reservation.total ||
    !Number.isSafeInteger(reservation.total.amount_minor) ||
    reservation.total.amount_minor < 0 ||
    reservation.total.currency_code !== 'CHF'
  ) {
    throw new Error(
      `Reservation Demo ${reservation.id || '(missing-id)'} has invalid parent, lifecycle, or money authority.`
    )
  }

  const previous = activeReservations[index - 1]
  if (previous && previous.departure_date > reservation.arrival_date) {
    throw new Error(
      `Reservation Demo ${previous.id} overlaps ${reservation.id} for ${demoPropertyId}.`
    )
  }
  reservationIds.add(reservation.id)
}
