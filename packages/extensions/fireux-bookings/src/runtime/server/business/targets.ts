import { assertFirestoreMutationSegment, defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
const target = (businessId: string, collection: string) => defineFirestoreMutationTarget({
  key: `business.bookings.${collection}`, lane: 'server', verbs: collection === 'booking-locks' ? ['create', 'update', 'delete'] : ['create', 'update'],
  database: { kind: 'runtime' },
  collectionPath: `businesses/${assertFirestoreMutationSegment(businessId, 'Business id')}/${collection}`,
})
export const businessBookingTargets = (id: string) => ({
  bookings: target(id, 'bookings'), locks: target(id, 'booking-locks'), settings: target(id, 'booking-settings'),
})
