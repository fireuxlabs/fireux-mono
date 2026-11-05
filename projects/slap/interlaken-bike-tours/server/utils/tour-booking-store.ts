import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import {
  InterlakenTourBookingError,
  type InterlakenTourBookingRecord,
} from './tour-booking'

const bookingTarget = defineFirestoreMutationTarget({
  key: 'interlaken-bike-tours.public-bookings',
  lane: 'server',
  verbs: ['create', 'update'],
  database: { kind: 'runtime' },
  collectionPath: 'interlaken_tour_bookings',
})

const dayTarget = defineFirestoreMutationTarget({
  key: 'interlaken-bike-tours.booking-days',
  lane: 'server',
  verbs: ['create', 'update', 'delete'],
  database: { kind: 'runtime' },
  collectionPath: 'interlaken_tour_booking_days',
})

export function createInterlakenTourBookingStore() {
  return {
    async isDateReserved(date: string) {
      const snapshot = await getRuntimeFirestore()
        .collection('interlaken_tour_booking_days')
        .doc(date)
        .get()
      return snapshot.exists
    },

    async reserve(date: string, booking: InterlakenTourBookingRecord) {
      await runGuardedServerTransaction(
        { kind: 'runtime' },
        async (transaction) => {
          const existing = await transaction.read(dayTarget, date)
          if (existing.exists) {
            throw new InterlakenTourBookingError(
              409,
              'slot_unavailable',
              'That private tour time is no longer available. Choose another date.'
            )
          }

          transaction.create(bookingTarget, booking.id, booking)
          transaction.create(dayTarget, date, {
            booking_id: booking.id,
            date,
            start_at: booking.start_at,
            end_at: booking.end_at,
            status: 'pending',
          })
        }
      )
    },

    async confirm(date: string, bookingId: string, calendarEventId: string) {
      await runGuardedServerTransaction(
        { kind: 'runtime' },
        async (transaction) => {
          const booking = await transaction.read(bookingTarget, bookingId)
          const day = await transaction.read(dayTarget, date)
          if (
            !booking.exists ||
            booking.data?.status !== 'pending' ||
            !day.exists ||
            day.data?.booking_id !== bookingId
          ) {
            throw new Error('The pending tour booking could not be finalized.')
          }

          transaction.update(bookingTarget, bookingId, {
            status: 'confirmed',
            calendar_event_id: calendarEventId,
            confirmed_at: new Date().toISOString(),
          })
          transaction.update(dayTarget, date, { status: 'confirmed' })
        }
      )
    },

    async release(date: string, bookingId: string) {
      await runGuardedServerTransaction(
        { kind: 'runtime' },
        async (transaction) => {
          const booking = await transaction.read(bookingTarget, bookingId)
          const day = await transaction.read(dayTarget, date)
          if (!booking.exists || booking.data?.status !== 'pending') return

          transaction.update(bookingTarget, bookingId, {
            status: 'failed',
            failed_at: new Date().toISOString(),
          })
          if (day.exists && day.data?.booking_id === bookingId) {
            transaction.delete(dayTarget, date)
          }
        }
      )
    },
  }
}
