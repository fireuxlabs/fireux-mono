import type {
  ReservationSource,
  ReservationStatus,
  ReservationSyncState,
} from '../models/reservation.model.ts'

export function reservationSourceLabel(source: ReservationSource) {
  const labels: Record<ReservationSource, string> = {
    direct: 'Direct',
    airbnb: 'Airbnb',
    booking_com: 'Booking.com',
    vrbo: 'Vrbo',
    manual: 'Manual',
    other: 'Other',
  }
  return labels[source]
}

export function reservationSourceColor(source: ReservationSource) {
  if (source === 'airbnb') return 'error'
  if (source === 'booking_com') return 'primary'
  if (source === 'direct') return 'success'
  if (source === 'vrbo') return 'warning'
  return 'neutral'
}

export function reservationStatusLabel(status: ReservationStatus) {
  return status.replace('_', ' ').replace(/^\w/, (value) => value.toUpperCase())
}

export function reservationStatusColor(status: ReservationStatus) {
  if (status === 'confirmed' || status === 'checked_in') return 'success'
  if (status === 'inquiry' || status === 'hold') return 'warning'
  if (status === 'cancelled') return 'error'
  return 'neutral'
}

export function reservationSyncLabel(state: ReservationSyncState) {
  if (state === 'local') return 'BuenoHost'
  return state.replace(/^\w/, (value) => value.toUpperCase())
}

export function reservationSyncColor(state: ReservationSyncState) {
  if (state === 'synced') return 'success'
  if (state === 'pending') return 'warning'
  if (state === 'stale' || state === 'error') return 'error'
  return 'neutral'
}
