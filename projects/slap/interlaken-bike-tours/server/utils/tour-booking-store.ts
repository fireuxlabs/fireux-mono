import { createBusinessBookingStore } from 'fireux-bookings/runtime/server/business/store'
import type { InterlakenTourBookingRecord } from './tour-booking'

/** Tours retain pricing and daily allocation policy; Bookings owns Business-scoped storage. */
export function createInterlakenTourBookingStore(businessId: string) {
  const store = createBusinessBookingStore(businessId)
  return {
    readAvailability: store.readAvailability,
    isDateReserved: store.isReserved,
    reserve: (date: string, booking: InterlakenTourBookingRecord) => store.reserve(date, {
      id: booking.id, service_id: booking.tour_slug, service_name: booking.tour_name,
      date: booking.date, start_at: booking.start_at, end_at: booking.end_at,
      party_size: booking.group_size, unit_price: booking.unit_price_chf,
      total_price: booking.total_price_chf, currency: 'CHF',
      guest_name: booking.guest_name, guest_email: booking.guest_email,
      status: booking.status, created_at: booking.created_at,
    }, booking.availability_revision),
    confirm: store.confirm,
    release: store.release,
  }
}
