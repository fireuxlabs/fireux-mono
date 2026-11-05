import type { BookingAvailability } from '../models/business-bookings'
export const defaultBookingAvailability = (): BookingAvailability => ({
  revision: 0, openWeekdays: [0, 1, 2, 3, 4, 5, 6], closedDates: [], departureTime: '09:00',
})
export function isBookingDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
}
export function readBookingAvailability(value: unknown): BookingAvailability {
  if (value === null || value === undefined) return defaultBookingAvailability()
  const input = value as BookingAvailability
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).some((key) => !['revision', 'openWeekdays', 'closedDates', 'departureTime'].includes(key)) ||
      !Number.isSafeInteger(input.revision) || input.revision < 0 ||
      !Array.isArray(input.openWeekdays) || input.openWeekdays.length > 7 ||
      !input.openWeekdays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) ||
      new Set(input.openWeekdays).size !== input.openWeekdays.length ||
      !Array.isArray(input.closedDates) || input.closedDates.length > 730 ||
      !input.closedDates.every(isBookingDate) || new Set(input.closedDates).size !== input.closedDates.length ||
      typeof input.departureTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.departureTime))
    throw new Error('Booking availability is invalid.')
  return { revision: input.revision, openWeekdays: [...input.openWeekdays].sort(), closedDates: [...input.closedDates].sort(), departureTime: input.departureTime }
}
export function isBookingDayOpen(settings: BookingAvailability, date: string) {
  return isBookingDate(date) && !settings.closedDates.includes(date) &&
    settings.openWeekdays.includes(new Date(`${date}T12:00:00Z`).getUTCDay())
}
