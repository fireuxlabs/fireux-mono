import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

export const serverKitchenMemberInvitationsTarget = (kitchenId: string) => {
  const kitchen = assertFirestoreMutationSegment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'kitchens.member-invitations',
    lane: 'server',
    verbs: ALL_FIRESTORE_MUTATION_VERBS,
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchen}/member-invitations`,
  })
}
