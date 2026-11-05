import { BUSINESS_MUTATION_TARGETS } from 'fireux-businesses/runtime/business/server/mutation-targets'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { BusinessBooking } from '../../models/business-bookings'
import { readBookingAvailability, isBookingDayOpen } from '../../utils/availability'
import { BookingError } from '../booking'
import { businessBookingTargets } from './targets'

export function createBusinessBookingStore(businessId: string) {
  const targets = businessBookingTargets(businessId)
  return {
    async readAvailability() {
      return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
        const [business, doc] = await Promise.all([tx.read(BUSINESS_MUTATION_TARGETS.businesses, businessId), tx.read(targets.settings, 'availability')])
        if (!business.exists) throw new BookingError(503, 'business_unavailable', 'Booking business is not available.')
        return readBookingAvailability(doc.exists ? doc.data : null)
      })
    },
    async isReserved(key: string) {
      return (await getRuntimeFirestore().collection(targets.locks.collectionPath).doc(key).get()).exists
    },
    async reserve(key: string, booking: BusinessBooking, expectedRevision: number) {
      await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
        const [business, lock, policy] = await Promise.all([tx.read(BUSINESS_MUTATION_TARGETS.businesses, businessId), tx.read(targets.locks, key), tx.read(targets.settings, 'availability')])
        if (!business.exists) throw new BookingError(503, 'business_unavailable', 'Booking business is not available.')
        const availability = readBookingAvailability(policy.exists ? policy.data : null)
        if (lock.exists || availability.revision !== expectedRevision || !isBookingDayOpen(availability, booking.date))
          throw new BookingError(409, 'slot_unavailable', 'Availability changed. Choose an available date and try again.')
        const { id: bookingId, ...record } = booking
        tx.create(targets.bookings, bookingId, record)
        tx.create(targets.locks, key, { booking_id: booking.id, date: booking.date, status: 'pending' })
      })
    },
    async confirm(key: string, bookingId: string, eventId: string) {
      await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
        const [booking, lock] = await Promise.all([tx.read(targets.bookings, bookingId), tx.read(targets.locks, key)])
        if (!booking.exists || booking.data?.status !== 'pending' || lock.data?.booking_id !== bookingId)
          throw new Error('Pending reservation could not be finalized.')
        tx.update(targets.bookings, bookingId, { status: 'confirmed', calendar_event_id: eventId })
        tx.update(targets.locks, key, { status: 'confirmed' })
      })
    },
    async release(key: string, bookingId: string) {
      await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
        const [booking, lock] = await Promise.all([tx.read(targets.bookings, bookingId), tx.read(targets.locks, key)])
        if (!booking.exists || booking.data?.status !== 'pending') return
        tx.update(targets.bookings, bookingId, { status: 'failed' })
        if (lock.data?.booking_id === bookingId) tx.delete(targets.locks, key)
      })
    },
  }
}
