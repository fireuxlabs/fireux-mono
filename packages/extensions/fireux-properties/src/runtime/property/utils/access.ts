import {
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

/** Property access is scoped to one App and one lifetime of its membership. */
export const propertyAccessCollection = (appId: string) =>
  `property_access/${assertFirestoreMutationSegment(appId, 'App id')}/users`

export const serverPropertyAccessTarget = (appId: string) =>
  defineFirestoreMutationTarget({
    key: 'property.access',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: propertyAccessCollection(appId),
  })
