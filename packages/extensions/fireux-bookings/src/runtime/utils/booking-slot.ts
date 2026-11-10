import type { BookingSlot } from '../types/booking-surface'

function isLocalDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false
  const date = new Date(`${value}:00Z`)
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value
  )
}

export function isValidBookingSlot(slot: BookingSlot) {
  return (
    Boolean(slot.id.trim()) &&
    isLocalDateTime(slot.startAt) &&
    isLocalDateTime(slot.endAt) &&
    slot.endAt > slot.startAt
  )
}
