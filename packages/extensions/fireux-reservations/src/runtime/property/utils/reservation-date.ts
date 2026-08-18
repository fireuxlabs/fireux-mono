import type { Reservation } from '../models/reservation.model.ts'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isDateOnly(value: unknown): value is string {
  const normalized = String(value ?? '').trim()
  if (!DATE_ONLY_PATTERN.test(normalized)) return false

  const date = new Date(`${normalized}T00:00:00Z`)
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === normalized
}

export function requireDateOnly(value: unknown, label: string) {
  const normalized = String(value ?? '').trim()
  if (!isDateOnly(normalized)) {
    throw new Error(`[fireux-reservations] ${label} must use YYYY-MM-DD.`)
  }
  return normalized
}

export function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00Z`)
}

export function formatDateOnly(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
) {
  if (!isDateOnly(value)) return value
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    ...options,
  }).format(parseDateOnly(value))
}

export function reservationNights(
  reservation: Pick<Reservation, 'arrival_date' | 'departure_date'>
) {
  if (
    !isDateOnly(reservation.arrival_date) ||
    !isDateOnly(reservation.departure_date)
  ) return 0

  const milliseconds =
    parseDateOnly(reservation.departure_date).getTime() -
    parseDateOnly(reservation.arrival_date).getTime()
  return Math.max(0, Math.round(milliseconds / 86_400_000))
}

export function reservationsOverlap(
  first: Pick<Reservation, 'arrival_date' | 'departure_date'>,
  second: Pick<Reservation, 'arrival_date' | 'departure_date'>
) {
  return first.arrival_date < second.departure_date &&
    second.arrival_date < first.departure_date
}

export function isActiveReservation(
  reservation: Pick<Reservation, 'status'>
) {
  return reservation.status !== 'cancelled'
}
