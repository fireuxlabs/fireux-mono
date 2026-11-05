import { defineFirestoreMutationTarget, assertFirestoreMutationSegment } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
export const BUSINESS_MUTATION_TARGETS = {
  businesses: defineFirestoreMutationTarget({
    key: 'businesses', lane: 'server', verbs: ['create', 'update'],
    database: { kind: 'runtime' }, collectionPath: 'businesses',
  }),
}
export const serverBusinessTeamTarget = (id: string) => defineFirestoreMutationTarget({
  key: 'businesses.team', lane: 'server', verbs: ['create', 'update', 'delete'],
  database: { kind: 'runtime' },
  collectionPath: `businesses/${assertFirestoreMutationSegment(id, 'Business id')}/team`,
})
export const businessAccessCollection = (appId: string) =>
  `business_access/${assertFirestoreMutationSegment(appId, 'App id')}/users`
export const serverBusinessAccessTarget = (appId: string) => defineFirestoreMutationTarget({
  key: 'business.access', lane: 'server', verbs: ['create', 'update'],
  database: { kind: 'runtime' }, collectionPath: businessAccessCollection(appId),
})
